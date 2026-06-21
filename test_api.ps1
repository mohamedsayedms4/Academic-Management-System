$baseUrl = "https://dirictiondback.digitalrace.net/api/v1"
$v2Url = "https://dirictiondback.digitalrace.net/api/v2"

# 1. Login
$loginBody = @{
    username = "admin"
    password = "admin123"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "https://dirictiondback.digitalrace.net/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
$token = $loginResponse.token
Write-Host "Token obtained"

# 2. Get all rounds
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type"  = "application/json"
}

$rounds = Invoke-RestMethod -Uri "$v2Url/rounds" -Method Get -Headers $headers
$firstRound = $rounds.content[0]
$roundId = $firstRound.id
Write-Host "Found Round ID: $roundId, Name: $($firstRound.name)"

# 3. Edit the round
$editBody = @{
    name = "$($firstRound.name) - EDITED"
    startDate = $firstRound.startDate
    endDate = $firstRound.endDate
    diplomaIds = @()
} | ConvertTo-Json

Write-Host "Editing round..."
$putResponse = Invoke-RestMethod -Uri "$v2Url/rounds/$roundId" -Method Put -Body $editBody -Headers $headers
Write-Host "Edit Response Name: $($putResponse.name)"

# 4. Create a dummy round to delete
$createBody = @{
    name = "Dummy Round To Delete"
    startDate = "2026-01-01"
    endDate = "2026-12-31"
    diplomaIds = @()
} | ConvertTo-Json

Write-Host "Creating dummy round..."
$createResponse = Invoke-RestMethod -Uri "$v2Url/rounds" -Method Post -Body $createBody -Headers $headers
$dummyRoundId = $createResponse.id
Write-Host "Dummy Round ID: $dummyRoundId"

# 5. Delete the dummy round
Write-Host "Deleting dummy round..."
Invoke-RestMethod -Uri "$v2Url/rounds/$dummyRoundId" -Method Delete -Headers $headers
Write-Host "Delete successful."

Write-Host "Test completed successfully!"
