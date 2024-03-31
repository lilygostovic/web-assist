# WebAssist Backend

The backend is built using FastAPI.

## Deploying / Running Locally

1. Install Docker with access to cuda
    - Windows:
        - Install Docker Desktop, ensure WSL-2 support is enabled
        - Navigate to Microsoft Store and install a Linux Image (e.g. Ubuntu LTS 20.04.6)

1. Run docker image ( `sudo docker run --gpus all -it -v ${DIR}:/workspace -p 8080:80  pytorch/pytorch:latest`)
    - replace `${DIR}` to where `Backend/src/` is
    - Description:
        - `--gpus all` tells docker to use all GPUs
        - `it` for interactive
        - `-v` to mount the `${DIR}` into the path `/workspace`
        - `-p 8080:80` to redirect the container port `80` to the host at port `8080`
        - use latest pytorch image
    - Windows: remember to run this command on WSL-2 Linux

1. Run `./setup.sh` inside the docker container.
    - Installs all required files
    - Starts the server in the container with host `0.0.0.0` and port `80`.

1. Test connection from outside the container.
    - Linux (Host) / WSL-2 Linux:
        `curl -X POST -H "Content-Type: application/json" -d '{}' http://localhost:8080/v1/hello`
    - Windows (Host):
         `Invoke-RestMethod -Method POST -Uri http://localhost:8080/v1/hello -ContentType "application/json" -Body '{}'`
