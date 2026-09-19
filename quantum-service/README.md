# Multi-backend quantum simulation service

This FastAPI service executes the visual circuit produced by Quantum Learning Studio using real quantum framework simulators.

## Backends

| Selection | Implementation | Local | API key |
| --- | --- | --- | --- |
| Qiskit Aer | `qiskit_aer.AerSimulator` | Yes | No |
| PennyLane | `default.qubit` | Yes | No |
| Cirq | `cirq.Simulator` | Yes | No |
| qBraid / IonQ | `qbraid.runtime.IonQProvider` | No | `IONQ_API_KEY` |

## Windows setup

From the repository root:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
npm run quantum:install
npm run dev
```

Health check: `http://127.0.0.1:8000/health`

If PowerShell prevents environment activation, use the virtual-environment Python directly:

```powershell
.\.venv\Scripts\python.exe -m pip install -r quantum-service\requirements.txt
.\.venv\Scripts\python.exe -m uvicorn quantum_service.main:app --app-dir quantum-service --host 127.0.0.1 --port 8000
```

## Optional qBraid setup

Install the optional package and place the real IonQ key in `quantum-service/.env.local`:

```powershell
npm run quantum:install:qbraid
```

```env
IONQ_API_KEY=replace_with_real_key
QBRAID_DEVICE_ID=simulator
```

Do not commit `.env.local`. qBraid/IonQ is an external cloud service and can have quotas or charges. The other four simulator choices remain free and local.
