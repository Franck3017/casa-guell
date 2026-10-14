-- Fase 7: RPC alternativa. No reemplaza la función de reserva existente.
-- Requiere revisión de seguridad y pruebas en transacción antes de desplegar.
CREATE OR REPLACE FUNCTION public.create_reservation_with_allergies(
 p_name text,p_phone text,p_email text,p_date date,p_time time without time zone,p_people integer,
 p_notes text DEFAULT NULL,p_locale text DEFAULT 'ca',
 p_allergen_ids smallint[] DEFAULT ARRAY[]::smallint[],
 p_allergy_text text DEFAULT NULL,p_allergy_consent boolean DEFAULT false)
RETURNS public.reservations LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
 v_ids smallint[];
 v_free_text text := nullif(btrim(coalesce(p_allergy_text,'')),'');
 v_has_allergy boolean;
 v_res public.reservations;
BEGIN
 IF char_length(v_free_text)>700 OR cardinality(coalesce(p_allergen_ids,ARRAY[]::smallint[]))>14
    OR array_position(p_allergen_ids,NULL) IS NOT NULL THEN
   RAISE EXCEPTION 'INVALID_ALLERGY_INPUT';
 END IF;
 SELECT coalesce(array_agg(distinct ids.id ORDER BY ids.id),ARRAY[]::smallint[])
 INTO v_ids FROM unnest(coalesce(p_allergen_ids,ARRAY[]::smallint[])) AS ids(id);
 IF EXISTS(SELECT 1 FROM unnest(v_ids) ids(id)
   LEFT JOIN public.allergens a ON a.id=ids.id AND a.is_active
   WHERE a.id IS NULL) THEN
   RAISE EXCEPTION 'INVALID_ALLERGY_INPUT';
 END IF;
 v_has_allergy:=cardinality(v_ids)>0 OR v_free_text IS NOT NULL;
 IF v_has_allergy AND p_allergy_consent IS DISTINCT FROM true THEN
   RAISE EXCEPTION 'ALLERGY_CONSENT_REQUIRED';
 END IF;
 -- El correo de recomendaciones es un flujo posterior; no se dispara aquí.
 v_res:=public.create_reservation(
 p_name=>p_name,p_phone=>p_phone,p_email=>p_email,p_date=>p_date,
 p_time=>p_time,p_people=>p_people,p_notes=>p_notes,p_locale=>p_locale);
 IF v_has_allergy THEN
   INSERT INTO private.reservation_dietary_requests
    (reservation_id,free_text,processing_consent_at,privacy_notice_version,kitchen_review_status)
   VALUES (v_res.id,v_free_text,now(),'booking-allergy-2026-10-v1','pending');
   INSERT INTO private.reservation_dietary_allergens(reservation_id,allergen_id)
   SELECT v_res.id,id FROM unnest(v_ids) ids(id);
   INSERT INTO private.communication_consents
    (reservation_id,purpose,channel,granted,policy_version,source)
   VALUES(v_res.id,'allergy_processing','web',true,'booking-allergy-2026-10-v1','booking_form');
 END IF;
 RETURN v_res;
END
$$;
REVOKE ALL ON FUNCTION public.create_reservation_with_allergies(
 text,text,text,date,time without time zone,integer,text,text,smallint[],text,boolean
) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.create_reservation_with_allergies(
 text,text,text,date,time without time zone,integer,text,text,smallint[],text,boolean
) TO anon,authenticated,service_role;
