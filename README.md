# WEB Assist

Using WebLinx models for chat-based web task assistant.

## Documentation

To use or develop the extension locally, please refer to its [documentation](./Extension/README.md).
To use or develop the backend locally, please refer to its documentation.

## Overall System

Our main purpose is to have a very intuitive frontend, and remove as much friction for the user. Hence, we chose to develop a Google Extension.

On a high level, a typical workflow would look like the following:
![System Diagram](./imgs/WebAssist%20-%20System%20Diagram.png)

For communication purposes, the extension and backend currently communicates through dedicated REST API calls. Details can be found [here](./Backend/API_info.md).

The backend server would be responsible of keeping track of the turns, and communicate with the two models. The following diagram is provide for clarity:

![Backend Diagram](./imgs/WebAssist%20-%20Backend.png)
