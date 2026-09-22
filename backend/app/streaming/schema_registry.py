import os
import json
import logging
from typing import Dict, Any, Optional
import jsonschema

logger = logging.getLogger("pulsercover.schema_registry")

class SchemaRegistryValidator:
    def __init__(self, schemas_dir: Optional[str] = None):
        if schemas_dir is None:
            # Default to root schemas directory
            base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
            self.schemas_dir = os.path.join(os.path.dirname(base_dir), "schemas")
            if not os.path.exists(self.schemas_dir):
                self.schemas_dir = os.path.join(base_dir, "schemas")
        else:
            self.schemas_dir = schemas_dir

        self.schemas: Dict[str, Any] = {}
        self.load_schemas()

    def load_schemas(self):
        """Loads all JSON schemas from the schemas directory"""
        if not os.path.exists(self.schemas_dir):
            logger.warning(f"Schemas directory not found: {self.schemas_dir}")
            return

        for filename in os.listdir(self.schemas_dir):
            if filename.endswith(".json"):
                topic_alias = filename.replace(".json", "")
                filepath = os.path.join(self.schemas_dir, filename)
                try:
                    with open(filepath, "r", encoding="utf-8") as f:
                        self.schemas[topic_alias] = json.load(f)
                    logger.info(f"Loaded schema for {topic_alias}")
                except Exception as e:
                    logger.error(f"Error loading schema {filepath}: {e}")

    def validate_event(self, schema_name: str, payload: Dict[str, Any]) -> tuple[bool, Optional[str]]:
        """Validate payload against schema"""
        if schema_name not in self.schemas:
            # Map topic names to schema names
            mapping = {
                "customer-events": "customer_event",
                "payment-events": "payment_event",
                "support-events": "support_event",
                "order-events": "order_event",
                "delivery-events": "delivery_event",
                "customer-risk": "customer_risk",
                "recovery-actions": "recovery_action",
                "system-anomalies": "system_anomaly"
            }
            schema_name = mapping.get(schema_name, schema_name)

        schema = self.schemas.get(schema_name)
        if not schema:
            return True, None # Permissive if schema not found
        
        try:
            jsonschema.validate(instance=payload, schema=schema)
            return True, None
        except jsonschema.ValidationError as err:
            return False, err.message
        except Exception as e:
            return False, str(e)

validator = SchemaRegistryValidator()
