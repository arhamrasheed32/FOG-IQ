from fastapi import APIRouter, Query, Path
from typing import Dict, List, Any, Optional

from backend.app.services.alert_service import alert_service

router = APIRouter()

@router.get("/")
def get_alerts(
    status: Optional[str] = Query(None),
    severity: Optional[str] = Query(None)
) -> List[Dict[str, Any]]:
    return alert_service.get_alerts(status=status, severity=severity)

@router.post("/{alert_id}/acknowledge")
def acknowledge_alert(alert_id: str = Path(...)) -> Dict[str, Any]:
    res = alert_service.acknowledge_alert(alert_id)
    if not res:
        return {"error": f"Alert {alert_id} not found"}
    return res

@router.post("/{alert_id}/resolve")
def resolve_alert(alert_id: str = Path(...)) -> Dict[str, Any]:
    res = alert_service.resolve_alert(alert_id)
    if not res:
        return {"error": f"Alert {alert_id} not found"}
    return res

