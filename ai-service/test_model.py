from transformers import pipeline

classifier = pipeline(model="lxyuan/vit-xray-pneumonia-classification")

# Test with a sample X-ray image from the internet
result = classifier("https://d2jx2rerrg6sh3.cloudfront.net/image-handler/ts/20200618040600/ri/650/picture/2020/6/shutterstock_786937069.jpg")

print(result)
