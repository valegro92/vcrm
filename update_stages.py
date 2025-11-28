import json
import re

file_path = '/Users/valentinogrossi/Documents/Claude Code/vCRM/src/App.js'

with open(file_path, 'r') as f:
    content = f.read()

# 1. Update pipelineStages
new_stages = "['Lead', 'In contatto', 'Follow Up da fare', 'Chiuso Vinto', 'Stand By', 'Revisionare offerta', 'Chiuso Perso']"
content = re.sub(r"const pipelineStages = \[.*?\];", f"const pipelineStages = {new_stages};", content)

# 2. Update COLORS
new_colors = "['#94a3b8', '#3b82f6', '#f59e0b', '#10b981', '#64748b', '#8b5cf6', '#ef4444']"
content = re.sub(r"const COLORS = \[.*?\];", f"const COLORS = {new_colors};", content)

# 3. Update initialOpportunities
start_marker = "const initialOpportunities = ["
end_marker = "];"
start_idx = content.find(start_marker)
end_idx = content.find(end_marker, start_idx)

if start_idx != -1 and end_idx != -1:
    json_str = content[start_idx + len(start_marker):end_idx]
    # Fix trailing commas if any (simple regex)
    json_str = re.sub(r",\s*]", "]", json_str)
    json_str = re.sub(r",\s*}", "}", json_str)
    
    try:
        data = json.loads(f"[{json_str}]")
        
        for item in data:
            os = item.get('originalStage', '').lower()
            if 'lead' in os:
                item['stage'] = 'Lead'
            elif 'in contatto' in os:
                item['stage'] = 'In contatto'
            elif 'follow up' in os:
                item['stage'] = 'Follow Up da fare'
            elif 'vinto' in os:
                item['stage'] = 'Chiuso Vinto'
            elif 'fattura' in os:
                item['stage'] = 'Chiuso Vinto'
            elif 'stand by' in os:
                item['stage'] = 'Stand By'
            elif 'perso' in os:
                item['stage'] = 'Chiuso Perso'
            elif 'revisionare' in os:
                item['stage'] = 'Revisionare offerta'
            else:
                item['stage'] = 'Lead' # Default
        
        new_json_str = json.dumps(data, indent=2)
        # Remove the outer brackets to fit back into the file structure
        new_json_str = new_json_str[1:-1] 
        
        content = content[:start_idx + len(start_marker)] + new_json_str + content[end_idx:]
        
    except json.JSONDecodeError as e:
        print(f"Error parsing JSON: {e}")

# 4. Update localStorage keys to _v3
content = content.replace('crm_contacts_v2', 'crm_contacts_v3')
content = content.replace('crm_opportunities_v2', 'crm_opportunities_v3')
content = content.replace('crm_tasks_v2', 'crm_tasks_v3')

# 5. Update handleDrop newProbabilities
new_probs = "{ 'Lead': 10, 'In contatto': 20, 'Follow Up da fare': 40, 'Chiuso Vinto': 100, 'Stand By': 0, 'Revisionare offerta': 60, 'Chiuso Perso': 0 }"
content = re.sub(r"const newProbabilities = \{.*?\};", f"const newProbabilities = {new_probs};", content)

# 6. Update modalType === 'opportunity' probability logic
prob_logic = "newItem.stage === 'Lead' ? 10 : newItem.stage === 'In contatto' ? 20 : newItem.stage === 'Follow Up da fare' ? 40 : newItem.stage === 'Revisionare offerta' ? 60 : newItem.stage === 'Chiuso Vinto' ? 100 : 0"
content = re.sub(r"probability: newItem\.stage === 'Qualificazione'.*?95,", f"probability: {prob_logic},", content)


with open(file_path, 'w') as f:
    f.write(content)

print("Successfully updated App.js")
