"""A2A 0.3 JSON-RPC example. Operator issues a token; no external action executes."""
import json
import os
import uuid
from urllib.request import Request, build_opener, HTTPRedirectHandler

class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None
request = Request(os.environ.get("AGENT_BASE_URL", "https://monikadvorackova.net") + "/a2a", data=json.dumps({"jsonrpc":"2.0","id":1,"method":"message/send","params":{"message":{"kind":"message","role":"user","messageId":str(uuid.uuid4()),"parts":[{"kind":"text","text":"What is AIGov?"}]}}}).encode(), headers={"Authorization":"Bearer " + os.environ["AGENT_A2A_KEY"],"Content-Type":"application/json"})
with build_opener(NoRedirect).open(request, timeout=15) as response:
    print(json.load(response))
