import base64
import requests
import io
from PIL import Image

def test_render(mermaid_code):
    print(f"Testing render with code:\n{mermaid_code!r}\n")
    try:
        graph_bytes = mermaid_code.encode("utf8")
        base64_bytes = base64.urlsafe_b64encode(graph_bytes)
        base64_string = base64_bytes.decode("ascii")
        
        url = f"https://mermaid.ink/img/{base64_string}?bgColor=333333"
        print(f"URL: {url}")
        
        response = requests.get(url, timeout=10)
        
        if response.status_code == 200:
            print("Success! Image received.")
            try:
                img = Image.open(io.BytesIO(response.content))
                print(f"Image size: {img.size}")
            except:
                print("Could not open image.")
        else:
            print(f"Failed description: {response.status_code}")
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"Exception: {e}")

# Failing content from logs
# failing_content = "graph TD\n A[User/Program] --> B{FastAPI API}\n B -- Authenticated POST Requests --> C[Backend Workflow (Document URLs & Questions)]\n C --> D[Structured JSON Answer]"

# Fixed content (Quoted labels)
fixed_content = 'graph TD\n A["User/Program"] --> B{"FastAPI API"}\n B -- "Authenticated POST Requests" --> C["Backend Workflow (Document URLs & Questions)"]\n C --> D["Structured JSON Answer"]'
test_render(fixed_content)
