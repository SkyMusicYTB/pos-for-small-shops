-- Fix audit function to handle business table correctly
CREATE OR REPLACE FUNCTION log_audit_event()
RETURNS TRIGGER AS $$
DECLARE
    business_id_value UUID;
BEGIN
    -- Determine the business_id based on the table
    IF TG_TABLE_NAME = 'business' THEN
        -- For business table, use the record's own ID as business_id
        IF TG_OP = 'DELETE' THEN
            business_id_value := OLD.id;
        ELSE
            business_id_value := NEW.id;
        END IF;
    ELSE
        -- For other tables, use the business_id field
        IF TG_OP = 'DELETE' THEN
            business_id_value := OLD.business_id;
        ELSE
            business_id_value := NEW.business_id;
        END IF;
    END IF;

    IF TG_OP = 'DELETE' THEN
        INSERT INTO audit_log (business_id, user_id, action, entity, entity_id, payload)
        VALUES (
            business_id_value,
            auth.uid(),
            'delete',
            TG_TABLE_NAME,
            OLD.id,
            row_to_json(OLD)
        );
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_log (business_id, user_id, action, entity, entity_id, payload)
        VALUES (
            business_id_value,
            auth.uid(),
            'update',
            TG_TABLE_NAME,
            NEW.id,
            jsonb_build_object('old', row_to_json(OLD), 'new', row_to_json(NEW))
        );
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO audit_log (business_id, user_id, action, entity, entity_id, payload)
        VALUES (
            business_id_value,
            auth.uid(),
            'create',
            TG_TABLE_NAME,
            NEW.id,
            row_to_json(NEW)
        );
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';