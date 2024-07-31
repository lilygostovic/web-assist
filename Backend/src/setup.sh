apt-get update
apt-get -y upgrade
pip install -r requirements.txt
pip install --upgrade huggingface-hub==0.24.0
apt-get -y install git
FLASH_ATTENTION_SKIP_CUDA_BUILD=TRUE pip install "flash-attn>=2.3.0" --no-build-isolation

uvicorn server:app --reload --host 0.0.0.0 --port 80