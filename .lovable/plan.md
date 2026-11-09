## Check Supabase health safely

1. Retry read-only Supabase health diagnostics after the connection pooler is available: recent Postgres errors, slow queries, and table activity statistics.
2. If diagnostics succeed, identify the concrete source of unhealthy status and recommend a targeted mitigation, without changing schema or application behavior without evidence.
3. If the pooler remains unavailable, report that the underlying cause cannot yet be verified and direct the next check to the Supabase project Health/Database status view.

### Current evidence
The initial database-statistics and slow-query checks could not connect because the Supabase connection pooler was unavailable. The cause of the unhealthy status is therefore unconfirmed. No database or application changes are proposed at this stage.
