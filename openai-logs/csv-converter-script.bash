jq -r -n '
  ["id","model","created","prompt_tokens","completion_tokens","last_user","final"],
  (inputs | [
    .id,
    .model,
    (.created | try todate catch tostring),
    .usage.prompt_tokens,
    .usage.completion_tokens,
    (([.messages[]? | select(.role=="user") | .content] | last // "") | gsub("\n"; " ") | .[0:1000]),
    (((.choices[0]? | .message?.content // .content) // "") | gsub("\n"; " ") | .[0:1000])
  ]) | @csv
' /home/abe/aisodan-lp/openai-logs/202509-logs-full.jsonl > /home/abe/aisodan-lp/openai-logs/logs.csv
