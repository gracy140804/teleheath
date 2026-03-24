from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..db.database import get_db
from ..models import models
from ..schemas import schemas
from ..api import deps
from ..services.notification_service import notification_service
from typing import List

router = APIRouter(prefix="/notifications", tags=["notifications"])

@router.get("/", response_model=List[schemas.NotificationResponse])
def get_my_notifications(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    return notification_service.get_user_notifications(db, current_user.id)

@router.post("/{notification_id}/read")
def mark_notification_as_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    notification = notification_service.mark_as_read(db, notification_id, current_user.id)
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"status": "success"}

@router.post("/read-all")
def mark_all_as_read(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    notifications = db.query(models.Notification).filter(
        models.Notification.user_id == current_user.id,
        models.Notification.is_read == False
    ).all()
    for n in notifications:
        n.is_read = True
    db.commit()
    return {"status": "success"}
