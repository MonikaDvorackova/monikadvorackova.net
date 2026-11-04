"""Dependency-free Python client. Python >= 3.10. No implicit retries for writes."""
import json
from urllib.error import HTTPError
from urllib.parse import urlencode
from urllib.request import Request, build_opener, HTTPRedirectHandler


class _NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


class AgentAPIError(Exception):
    def __init__(self, status, code, message):
        self.status, self.code = status, code
        super().__init__(message)


class AgentClient:
    def __init__(self, base_url="https://monikadvorackova.net", lang="en", token=None):
        if lang not in ("en", "cs"):
            raise ValueError("Language must be en or cs")
        self.base_url, self.lang, self.token = base_url.rstrip("/"), lang, token

    def request(self, path, payload=None, idempotency_key=None, **query):
        if not path or any(c not in "abcdefghijklmnopqrstuvwxyz0123456789/-" for c in path):
            raise ValueError("Invalid API path")
        headers = {"Accept": "application/json"}
        if self.token:
            headers["Authorization"] = "Bearer " + self.token
        if idempotency_key:
            headers["Idempotency-Key"] = idempotency_key
        data = None
        if payload is not None:
            headers["Content-Type"] = "application/json"
            data = json.dumps(payload).encode("utf-8")
        request = Request(self.base_url + "/api/v1/" + path + "?" + urlencode({"lang": self.lang, **query}), data=data, headers=headers)
        try:
            with build_opener(_NoRedirect).open(request, timeout=10) as response:
                return json.load(response)["data"]
        except HTTPError as error:
            try:
                details = json.load(error)["error"]
            except (ValueError, KeyError):
                details = {"code": "request_failed", "message": "Request failed"}
            raise AgentAPIError(error.code, details["code"], details["message"]) from None

    def profile(self):
        return self.request("profile")

    def ask(self, question):
        return self.request("ask", {"question": question, "lang": self.lang})

    def prepare_inquiry(self, **kwargs):
        return self.request("inquiries/prepare", kwargs)

    def collection(self, resource, limit=20, offset=0):
        if resource not in ("skills", "projects", "publications", "contributions", "evidence", "changes"):
            raise ValueError("Unknown collection")
        return self.request(resource, limit=limit, offset=offset)

    def search(self, query, **filters):
        return self.request("search", q=query, **filters)

    def graph(self, **query):
        return self.request("graph", **query)

    def verify_evidence(self, identifier, digest=None):
        return self.request("evidence/verify", id=identifier, **({"digest": digest} if digest else {}))

    def match(self, requirements):
        return self.request("match", {"requirements": requirements, "lang": self.lang})

    def resume(self):
        return self.request("resume")

    def citations(self):
        return self.request("citations")

    def availability(self):
        return self.request("availability")

    def submit_inquiry(self, payload, idempotency_key):
        return self.request("inquiries", payload, idempotency_key)
