-- Enable Row Level Security

alter table profiles enable row level security;
alter table sensor_readings enable row level security;
alter table gate_control enable row level security;
alter table alerts enable row level security;
alter table ml_predictions enable row level security;

create policy "Public sensor read"
on sensor_readings for select
to anon
using (true);

create policy "Public alert read"
on alerts for select
to anon
using (true);

create policy "Operator gate control"
on gate_control for all
to authenticated
using (true)
with check (true);