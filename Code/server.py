from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT config
JWT_SECRET = os.environ.get('JWT_SECRET', 'default_secret')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_HOURS = 168  # 7 days

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

# Models
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    name: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AuthResponse(BaseModel):
    token: str
    user: User

class WorkoutPlanInput(BaseModel):
    goal: str
    experience_level: str
    equipment: str
    days_per_week: int
    duration_per_session: int
    additional_notes: Optional[str] = None

class WorkoutPlan(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    goal: str
    experience_level: str
    equipment: str
    days_per_week: int
    duration_per_session: int
    plan_content: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class WorkoutPlanResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    goal: str
    experience_level: str
    equipment: str
    days_per_week: int
    duration_per_session: int
    plan_content: str
    created_at: str

# Helper functions
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str) -> str:
    expiration = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    payload = {
        'user_id': user_id,
        'exp': expiration
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_token(token: str) -> str:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload['user_id']
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    token = credentials.credentials
    user_id = verify_token(token)
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user_id

# Routes
@api_router.post("/auth/register", response_model=AuthResponse)
async def register(user_input: UserRegister):
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_input.email}, {"_id": 0})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    user = User(
        email=user_input.email,
        name=user_input.name
    )
    user_dict = user.model_dump()
    user_dict['password'] = hash_password(user_input.password)
    user_dict['created_at'] = user_dict['created_at'].isoformat()
    
    await db.users.insert_one(user_dict)
    
    token = create_token(user.id)
    return AuthResponse(token=token, user=user)

@api_router.post("/auth/login", response_model=AuthResponse)
async def login(user_input: UserLogin):
    user_doc = await db.users.find_one({"email": user_input.email}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not verify_password(user_input.password, user_doc['password']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    user = User(
        id=user_doc['id'],
        email=user_doc['email'],
        name=user_doc['name'],
        created_at=datetime.fromisoformat(user_doc['created_at']) if isinstance(user_doc['created_at'], str) else user_doc['created_at']
    )
    
    token = create_token(user.id)
    return AuthResponse(token=token, user=user)

@api_router.post("/workout-plans/generate", response_model=WorkoutPlanResponse)
async def generate_workout_plan(plan_input: WorkoutPlanInput, user_id: str = Depends(get_current_user)):
    # Create AI prompt
    prompt = f"""Create a detailed, personalized workout plan with the following specifications:

Fitness Goal: {plan_input.goal}
Experience Level: {plan_input.experience_level}
Available Equipment: {plan_input.equipment}
Workout Frequency: {plan_input.days_per_week} days per week
Session Duration: {plan_input.duration_per_session} minutes
{f'Additional Notes: {plan_input.additional_notes}' if plan_input.additional_notes else ''}

Please provide:
1. A weekly workout schedule (Day 1, Day 2, etc.)
2. Specific exercises for each day with sets, reps, and rest periods
3. Warm-up and cool-down routines
4. Progressive overload recommendations
5. Safety tips and form cues

Format the plan in a clear, structured way that's easy to follow."""
    
    try:
        # Generate workout plan using AI
        api_key = os.environ.get('EMERGENT_LLM_KEY')
        chat = LlmChat(
            api_key=api_key,
            session_id=f"workout_plan_{uuid.uuid4()}",
            system_message="You are an expert fitness trainer and workout planner. Create detailed, safe, and effective workout plans tailored to individual needs."
        )
        chat.with_model("openai", "gpt-5.2")
        
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        # Save workout plan
        workout_plan = WorkoutPlan(
            user_id=user_id,
            goal=plan_input.goal,
            experience_level=plan_input.experience_level,
            equipment=plan_input.equipment,
            days_per_week=plan_input.days_per_week,
            duration_per_session=plan_input.duration_per_session,
            plan_content=response
        )
        
        plan_dict = workout_plan.model_dump()
        plan_dict['created_at'] = plan_dict['created_at'].isoformat()
        
        await db.workout_plans.insert_one(plan_dict)
        
        return WorkoutPlanResponse(
            id=workout_plan.id,
            goal=workout_plan.goal,
            experience_level=workout_plan.experience_level,
            equipment=workout_plan.equipment,
            days_per_week=workout_plan.days_per_week,
            duration_per_session=workout_plan.duration_per_session,
            plan_content=workout_plan.plan_content,
            created_at=plan_dict['created_at']
        )
        
    except Exception as e:
        logging.error(f"Error generating workout plan: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate workout plan: {str(e)}")

@api_router.get("/workout-plans", response_model=List[WorkoutPlanResponse])
async def get_workout_plans(user_id: str = Depends(get_current_user)):
    plans = await db.workout_plans.find({"user_id": user_id}, {"_id": 0}).sort("created_at", -1).to_list(100)
    
    return [
        WorkoutPlanResponse(
            id=plan['id'],
            goal=plan['goal'],
            experience_level=plan['experience_level'],
            equipment=plan['equipment'],
            days_per_week=plan['days_per_week'],
            duration_per_session=plan['duration_per_session'],
            plan_content=plan['plan_content'],
            created_at=plan['created_at']
        )
        for plan in plans
    ]

@api_router.get("/workout-plans/{plan_id}", response_model=WorkoutPlanResponse)
async def get_workout_plan(plan_id: str, user_id: str = Depends(get_current_user)):
    plan = await db.workout_plans.find_one({"id": plan_id, "user_id": user_id}, {"_id": 0})
    if not plan:
        raise HTTPException(status_code=404, detail="Workout plan not found")
    
    return WorkoutPlanResponse(
        id=plan['id'],
        goal=plan['goal'],
        experience_level=plan['experience_level'],
        equipment=plan['equipment'],
        days_per_week=plan['days_per_week'],
        duration_per_session=plan['duration_per_session'],
        plan_content=plan['plan_content'],
        created_at=plan['created_at']
    )

@api_router.delete("/workout-plans/{plan_id}")
async def delete_workout_plan(plan_id: str, user_id: str = Depends(get_current_user)):
    result = await db.workout_plans.delete_one({"id": plan_id, "user_id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Workout plan not found")
    return {"message": "Workout plan deleted successfully"}

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
