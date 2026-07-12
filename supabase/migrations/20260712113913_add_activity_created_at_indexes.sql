create index if not exists messages_created_at_idx
  on public.messages (created_at desc);

create index if not exists visits_created_at_idx
  on public.visits (created_at desc);
