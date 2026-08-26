"""
Root ASGI Proxy for Render Cloud Deployment
Loads SDAS ML FastAPI app from SDAS_Full_Project/03_Machine_Learning/inference_server.py
"""
import importlib.util
import os
import sys

_ml_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'SDAS_Full_Project', '03_Machine_Learning')
if _ml_dir not in sys.path:
    sys.path.insert(0, _ml_dir)

_ml_server_path = os.path.join(_ml_dir, 'inference_server.py')
_spec = importlib.util.spec_from_file_location("sdas_ml_inference_module", _ml_server_path)
_module = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_module)

app = _module.app

if __name__ == '__main__':
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
