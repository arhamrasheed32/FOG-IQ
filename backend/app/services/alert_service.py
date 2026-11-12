"""
FOG-IQ Alert & Operational Incident Management Service
Handles lifecycle of active alerts: generation, acknowledgment, resolution, and SNS broadcast.
"""

import uuid
from datetime import datetime
from typing import Dict, List, Any, Optional

from backend.app.integrations.aws_adapter import aws_adapter

class AlertService:
    def __init__(self):
        self.alerts: List[Dict[str, Any]] = []
        self._init_default_alerts()

    def _init_default_alerts(self):
        # Pre-populate with realistic baseline operational incidents
        self.create_alert(
            severity="CRITICAL",
            corridor_id="ANNA_SALAI",
            sensor_id="S03",
            source="FOG_GATEWAY_CORRELATION",
            description="Severe bottleneck congestion at Gemini Flyover. Average speed collapsed to 14 km/h."
        )
        self.create_alert(
            severity="WARNING",
            corridor_id="OMR",
            sensor_id="S08",
            source="EDGE_ANOMALY_DETECTOR",
            description="Queue accumulation detected at Tidel Park junction exceeding 320m."
        )
        self.create_alert(
            severity="INFO",
            corridor_id="GST_ROAD",
            sensor_id="S15",
            source="SYSTEM_OBSERVABILITY",
            description="Airport junction sensor S15 operating normally on Edge Greengrass local runtime."
        )

    def create_alert(
        self,
        severity: str,
        corridor_id: str,
        sensor_id: str,
        source: str,
        description: str
    ) -> Dict[str, Any]:
        alert = {
            "id": f"ALT-{uuid.uuid4().hex[:8].upper()}",
            "severity": severity.upper(),
            "corridor_id": corridor_id,
            "sensor_id": sensor_id,
            "source": source,
            "description": description,
            "status": "ACTIVE",  # ACTIVE, ACKNOWLEDGED, RESOLVED
            "created_at": datetime.utcnow().isoformat() + "Z",
            "acknowledged_at": None,
            "resolved_at": None
        }
        self.alerts.insert(0, alert)
        if len(self.alerts) > 200:
            self.alerts.pop()

        # Attempt SNS broadcast if in AWS mode
        if severity.upper() == "CRITICAL":
            aws_adapter.publish_alert(alert)

        return alert

    def get_alerts(self, status: Optional[str] = None, severity: Optional[str] = None) -> List[Dict[str, Any]]:
        res = self.alerts
        if status:
            res = [a for a in res if a["status"].lower() == status.lower()]
        if severity:
            res = [a for a in res if a["severity"].lower() == severity.lower()]
        return res

    def acknowledge_alert(self, alert_id: str) -> Optional[Dict[str, Any]]:
        for a in self.alerts:
            if a["id"] == alert_id:
                a["status"] = "ACKNOWLEDGED"
                a["acknowledged_at"] = datetime.utcnow().isoformat() + "Z"
                return a
        return None

    def resolve_alert(self, alert_id: str) -> Optional[Dict[str, Any]]:
        for a in self.alerts:
            if a["id"] == alert_id:
                a["status"] = "RESOLVED"
                a["resolved_at"] = datetime.utcnow().isoformat() + "Z"
                return a
        return None

alert_service = AlertService()

