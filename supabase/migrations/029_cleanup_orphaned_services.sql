-- Delete all repair_request_services records with orphaned service_id
-- This fixes the 409 Conflict by cleaning up broken foreign key references

DELETE FROM repair_request_services 
WHERE service_id NOT IN (
    SELECT id FROM controller_services
);
