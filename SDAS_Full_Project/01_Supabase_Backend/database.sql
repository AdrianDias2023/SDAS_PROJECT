-- SDAS Database Schema

create table profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 name text not null,
 role text default 'OPERATOR',
 created_at timestamp default now()
);

create table sensor_readings (
 id bigserial primary key,
 device_id text not null,
 water_level float not null,
 temperature float,
 humidity float,
 rainfall float,
 sensor_health text default 'NORMAL',
 created_at timestamp default now()
);

create table gate_control (
 id bigserial primary key,
 gate_percentage float default 0,
 mode text default 'AUTO',
 command text default 'CLOSE',
 operator_id uuid references profiles(id),
 created_at timestamp default now()
);

create table alerts (
 id bigserial primary key,
 alert_type text,
 severity text,
 message text,
 created_at timestamp default now()
);

create table ml_predictions (
 id bigserial primary key,
 current_level float,
 predicted_level float,
 risk_level text,
 prediction_time timestamp default now()
);