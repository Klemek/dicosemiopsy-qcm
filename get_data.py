import requests
import re
import json

BASE_URL = "http://dicosemiopsy.asso-aesp.fr"

r = requests.get(BASE_URL + "/index.php/lexique.html")

data = []

for path in re.findall(r"<li><a href=\"(.*)\">.*</a></li>", r.content.decode("utf-8")):
    r = requests.get(BASE_URL + path)
    results = re.findall(
        r"<h1>(.+)</h1>\s+(.+)</div>\s+</div><!-- /content -->",
        r.content.decode("utf-8").replace("&#039;", "'"),
        re.MULTILINE,
    )
    data += [{"name": results[0][0], "description": results[0][1]}]

with open("data.json", mode="w") as f:
    f.write(json.dumps(data))
