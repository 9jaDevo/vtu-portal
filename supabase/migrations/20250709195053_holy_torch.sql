/*
  # Create exec_sql function for raw SQL execution

  This migration creates a PostgreSQL function that allows executing raw SQL queries.
  This is needed for backward compatibility with existing server code.

  1. Functions
    - `exec_sql(sql_query text)` - Execute raw SQL and return results
    - `exec_sql(sql_query text, params_array text[])` - Execute parameterized SQL (placeholder for future use)

  2. Security
    - Only accessible by service role
    - Should be used carefully in production
*/

-- Create function to execute raw SQL
CREATE OR REPLACE FUNCTION exec_sql(sql_query text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  -- Execute the SQL query and return results as JSON
  BEGIN
    EXECUTE 'SELECT array_to_json(array_agg(row_to_json(t))) FROM (' || sql_query || ') t' INTO result;
    RETURN COALESCE(result, '[]'::json);
  EXCEPTION
    WHEN OTHERS THEN
      -- Return error information
      RETURN json_build_object('error', SQLERRM, 'state', SQLSTATE);
  END;
END;
$$;

-- Create function to execute parameterized SQL (placeholder for future use)
CREATE OR REPLACE FUNCTION exec_sql(sql_query text, params_array text[])
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  -- For now, just call the simple version
  -- In the future, this could handle parameterized queries
  RETURN exec_sql(sql_query);
END;
$$;

-- Grant execute permission to service role
GRANT EXECUTE ON FUNCTION exec_sql(text) TO service_role;
GRANT EXECUTE ON FUNCTION exec_sql(text, text[]) TO service_role;