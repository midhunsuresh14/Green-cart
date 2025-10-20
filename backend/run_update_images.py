import subprocess
import sys

# Run the update_product_images.py script and automatically respond with "y"
process = subprocess.Popen([sys.executable, "update_product_images.py"], 
                          stdin=subprocess.PIPE, 
                          stdout=subprocess.PIPE, 
                          stderr=subprocess.PIPE, 
                          text=True)

output, error = process.communicate(input="y\n")

print("Output:")
print(output)
if error:
    print("Error:")
    print(error)