$ErrorActionPreference = 'Stop'
$base = 'http://localhost:4000/v1'

function Post([string]$path, [object]$body) {
    $json = $body | ConvertTo-Json -Depth 8 -Compress
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
    return Invoke-RestMethod -Method POST -Uri "$base$path" -ContentType 'application/json; charset=utf-8' -Body $bytes
}

Write-Host '--- HEALTH ---'
(Invoke-RestMethod -Uri "$base/health") | ConvertTo-Json -Depth 4

Write-Host '--- CATALOG ---'
$cat = Invoke-RestMethod -Uri "$base/catalog"
"$($cat.services.Count) services, $($cat.garments.Count) garments, $($cat.prices.Count) prices"

Write-Host '--- CREATE CUSTOMER ---'
$cust = Post '/customers' @{ fullName='Ada Lovelace'; phone='+2348012345678'; address='12 Algorithm St, Lekki' }
$cust | ConvertTo-Json -Depth 4

Write-Host '--- CREATE ORDER ---'
$svc = $cat.services[0].id
$g = $cat.garments[0].id
$order = Post '/orders' @{ customerId = $cust.id; items = @(@{ serviceTypeId = $svc; garmentTypeId = $g; quantity = 3 }) }
"order $($order.number), total=$($order.totalKobo) kobo, status=$($order.status)"

foreach ($s in @('washing','ironing','ready')) {
    Write-Host "--- ADVANCE: $s ---"
    Post "/orders/$($order.id)/status" @{ status = $s } | Out-Null
}

Write-Host '--- RECORD PAYMENT (partial) ---'
$half = [int]($order.totalKobo / 2)
$pay = Post "/orders/$($order.id)/payments" @{ amountKobo = $half; method = 'cash' }
"paid $($pay.amountKobo) kobo via $($pay.method)"

Write-Host '--- FETCH ORDER ---'
$o2 = Invoke-RestMethod -Uri "$base/orders/$($order.id)"
"$($o2.number) status=$($o2.status) paid=$($o2.paidKobo)/$($o2.totalKobo) events=$($o2.statusEvents.Count)"

Write-Host '--- BALANCES ---'
$bal = Invoke-RestMethod -Uri "$base/customers/balances/unpaid"
$bal | ConvertTo-Json -Depth 5

Write-Host '--- NOTIFICATIONS ---'
$ns = Invoke-RestMethod -Uri "$base/orders/$($order.id)/notifications"
"$($ns.Count) notifications recorded"
