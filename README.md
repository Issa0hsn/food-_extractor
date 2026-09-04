# Food Extractor
this project extract food items from text and do some classification using a fine tuned model and static web interface.

## technologies

* **Model:** we use a SLM ( gemma-3-270m-it) and fine tuned it using a dataset of ~1400 samples ("mrdbourke/FoodExtract-1k") for the extraction task.
* **Model link:** [Hugging Face Model Repository](https://huggingface.co/isahsn/FoodExtract-gemma-3-270m-fine-tune-v1)
* **Backend:** local API server hosting the model and handle the request using FASTAPI .
* **Frontend:** we used a simple html,css,js code for the interface.

## learning journey 

### 1.catastrophic Forgetting 
fully fine tune a model provides strong capabilities for specific task, but it affects its general knowledge so it will
fail with nearly all task except that one it fine tuned to do.  

### 2.Full-stack Integration 
this project taught me a little bit of how backend program and the frontend interface work together to make one useful software.
knowing how to connect files with each others moves the challenge to the next level.

## how to run it 
First,clone this repo and download requirements
```bash
git clone [https://github.com/isahsn/food-_extractor.git](https://github.com/isahsn/food-_extractor.git)
cd food-_extractor
pip install -r requirements.txt  
```
then run the "main.py" file after filling the paths
finally open "index.html" on your browser and use the website.
[App Screenshot](finetuning\Screenshot 2026-09-04 143241.png)
