from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import pipeline

tags_dict = {
 'np': 'nutrition panel',
 'il': 'ingredient list',
 'me': 'menu',
 're': 'recipe',
 'fi': 'food items',
 'di': 'drink items',
 'fa': 'food advertisement ',
 'fp': 'food packaging'}

# مسار مجلد الموديل المحلي (نزل ملفات الموديل يدوياً وحطها بهذا المجلد)
model_path = r"the model folder path"

# تحميل الموديل مرة وحدة عند تشغيل السيرفر - من المجلد المحلي، بدون إنترنت
pipe = pipeline("text-generation", model=model_path)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
class TextRequest(BaseModel):
    text: str

def split_list(value):
    # "Baked beans, fried eggs" -> ["Baked beans", "fried eggs"]
    return [item.strip() for item in value.split(",") if item.strip()]

@app.post("/extract")
def extract_food(request: TextRequest):
    message=[ {"role":"user","content":request.text}]
    try:
        result = pipe(message, max_new_tokens=200)
        generated = result[0]['generated_text']

        # generated_text is a chat list like:
        # [{'role': 'user', ...}, {'role': 'assistant', 'content': 'food_or_drink: 1\ntags: fi, di\n...'}]
        # but can also come back as a plain string, so handle both
        if isinstance(generated, list):
            model_output_str = next(
                (m["content"] for m in reversed(generated) if m.get("role") == "assistant"),
                None)
        else:
            model_output_str = generated
        if model_output_str is None:
            raise ValueError("No assistant message in model output")

        # parse the "key: value" lines of the assistant content
        parsed = {}
        for line in model_output_str.strip().splitlines():
            key, sep, value = line.partition(":")
            if sep:
                parsed[key.strip()] = value.strip()

        original_tags = split_list(parsed.get("tags", ""))
        full_tags=[tags_dict.get(tag,tag) for tag in original_tags]

        return {
            "food_or_drink": parsed.get("food_or_drink", "0") == "1",
            "tags": full_tags,
            "foods": split_list(parsed.get("foods", "")),
            "drinks": split_list(parsed.get("drinks", "")),
        }
    except Exception as e:
        return {"error": "Failed to process the model output", "details": str(e)}

# هاد البلوك بخلي python main.py يشغل السيرفر مباشرة بدون ما نكتب أمر uvicorn
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
