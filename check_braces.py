
filename = '/Users/valentinogrossi/Documents/Claude Code/vCRM/src/App.js'

with open(filename, 'r') as f:
    lines = f.readlines()

balance = 0
stack = []

for i, line in enumerate(lines):
    for char in line:
        if char == '{':
            balance += 1
            stack.append(i + 1)
        elif char == '}':
            balance -= 1
            if stack:
                stack.pop()
            else:
                print(f"Extra closing brace at line {i + 1}")

print(f"Final balance: {balance}")
if balance > 0:
    print(f"Unclosed braces starting at lines: {stack[:5]} ... {stack[-5:]}")
