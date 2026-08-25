create or replace function handle_accepted_request()
returns trigger as $$
begin
  if new.status = 'accepted' and old.status <> 'accepted' then
    update seekers set listed = false where user_id = new.user_id;
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trigger_accepted_request on join_requests;

create trigger trigger_accepted_request
after update on join_requests
for each row execute function handle_accepted_request();
