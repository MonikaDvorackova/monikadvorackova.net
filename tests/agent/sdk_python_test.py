import importlib.util
import io
import json
import unittest
from unittest.mock import patch, MagicMock
spec = importlib.util.spec_from_file_location('agent_client', 'sdks/python/agent_client.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

class SDKTests(unittest.TestCase):
    def test_profile_and_search_parameters(self):
        response = io.BytesIO(json.dumps({'data': {'title': 'Monika'}}).encode())
        response.__enter__ = lambda value: value
        opener = MagicMock()
        opener.open.return_value.__enter__.return_value = response
        with patch.object(module, 'build_opener', return_value=opener):
            result = module.AgentClient(lang='cs').search('MLOps')
        self.assertEqual(result['title'], 'Monika')
        self.assertIn('q=MLOps', opener.open.call_args.args[0].full_url)
        self.assertIn('lang=cs', opener.open.call_args.args[0].full_url)
    def test_no_redirect_token_forwarding(self):
        self.assertIsNone(module._NoRedirect().redirect_request(None,None,302,'',{},'https://attacker.example'))
    def test_reject_invalid_path(self):
        with self.assertRaises(ValueError):
            module.AgentClient().request('../private')

if __name__ == '__main__':
    unittest.main()
