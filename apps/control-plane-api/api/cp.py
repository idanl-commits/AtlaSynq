"""Control-plane API routes — signup, login, me, workspaces."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database.connection import get_db
from database.models import User, Organization, Workspace, Role, Membership
from app.schemas import SignupRequest, LoginRequest, TokenResponse, UserResponse, WorkspaceCreate, WorkspaceResponse
from app.auth import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/api/cp", tags=["control-plane"])


@router.post("/signup", response_model=TokenResponse)
async def signup(req: SignupRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == req.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(full_name=req.full_name, email=req.email, password_hash=hash_password(req.password))
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token(user.id, user.email)
    return TokenResponse(access_token=token)


@router.post("/login", response_model=TokenResponse)
async def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token(user.id, user.email)
    return TokenResponse(access_token=token)


@router.get("/me", response_model=UserResponse)
async def me(user: User = Depends(get_current_user)):
    return UserResponse(id=user.id, full_name=user.full_name, email=user.email)


@router.post("/workspaces", response_model=WorkspaceResponse)
async def create_workspace(
    req: WorkspaceCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    memb = db.query(Membership).filter(Membership.user_id == user.id).first()
    org_id = None
    if memb:
        ws_existing = db.query(Workspace).get(memb.workspace_id)
        if ws_existing:
            org_id = ws_existing.org_id
    if not org_id:
        org = Organization(name=f"{user.email}'s org")
        db.add(org)
        db.flush()
        role = Role(org_id=org.id, name="owner")
        db.add(role)
        db.flush()
        org_id = org.id
    role = db.query(Role).filter(Role.org_id == org_id, Role.name == "owner").first()
    if not role:
        role = Role(org_id=org_id, name="owner")
        db.add(role)
        db.flush()
    ws = Workspace(org_id=org_id, name=req.name)
    db.add(ws)
    db.flush()
    db.add(Membership(user_id=user.id, workspace_id=ws.id, role_id=role.id))
    db.commit()
    db.refresh(ws)
    return WorkspaceResponse(id=ws.id, org_id=ws.org_id, name=ws.name)


@router.get("/workspaces", response_model=list[WorkspaceResponse])
async def list_workspaces(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    memberships = db.query(Membership).filter(Membership.user_id == user.id).all()
    workspaces = [
        db.query(Workspace).get(m.workspace_id)
        for m in memberships
        if db.query(Workspace).get(m.workspace_id)
    ]
    return [WorkspaceResponse(id=w.id, org_id=w.org_id, name=w.name) for w in workspaces]
