INSERT INTO public.user_roles (user_id, role)
VALUES ('32eee7cf-3582-43dc-ba4a-6adaf3243fa5', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;