from sqlalchemy.orm import Session
from ..models import models
from ..schemas import schemas
from datetime import datetime
from typing import List

class NotificationService:
    @staticmethod
    def create_notification(
        db: Session,
        user_id: int,
        title: str,
        message: str,
        notification_type: str,
        link: str = None
    ):
        notification = models.Notification(
            user_id=user_id,
            title=title,
            message=message,
            type=notification_type,
            link=link
        )
        db.add(notification)
        db.commit()
        db.refresh(notification)
        return notification

    @staticmethod
    def get_user_notifications(db: Session, user_id: int, limit: int = 20) -> List[models.Notification]:
        return db.query(models.Notification).filter(
            models.Notification.user_id == user_id
        ).order_by(models.Notification.created_at.desc()).limit(limit).all()

    @staticmethod
    def mark_as_read(db: Session, notification_id: int, user_id: int):
        notification = db.query(models.Notification).filter(
            models.Notification.id == notification_id,
            models.Notification.user_id == user_id
        ).first()
        if notification:
            notification.is_read = True
            db.commit()
        return notification

notification_service = NotificationService()
