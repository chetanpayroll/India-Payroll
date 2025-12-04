# ================================================================
# LEAVE & ATTENDANCE MODULE - VERIFICATION SCRIPT
# ================================================================

Write-Host "🔍 Verifying Leave & Attendance Implementation..." -ForegroundColor Cyan

$baseUrl = "http://localhost:3000"

# List of endpoints to check
$endpoints = @(
    "/api/leave",
    "/api/leave/apply",
    "/api/leave/balance",
    "/api/attendance",
    "/api/attendance/punch-in",
    # If we get 404, it means the route is missing.
    
    try {
        $response = Invoke-WebRequest -Uri "$baseUrl$endpoint" -Method GET -ErrorAction Stop
        Write-Host " ✅ OK (Status: $($response.StatusCode))" -ForegroundColor Green
    }
    catch {
        $status = $_.Exception.Response.StatusCode.value__
        if ($status -eq 401) {
            Write-Host " ✅ OK (Protected)" -ForegroundColor Green
        }
        elseif ($status -eq 405) {
            Write-Host " ✅ OK (Method Not Allowed - Route Exists)" -ForegroundColor Green
        }
        elseif ($status -eq 404) {
            Write-Host " ❌ MISSING (404 Not Found)" -ForegroundColor Red
        }
        else {
            Write-Host " ⚠️  Status: $status" -ForegroundColor Yellow
        }
    }
}

Write-Host "`nChecking Frontend Pages..." -ForegroundColor Cyan
$pages = @(
    "/dashboard/leave",
    "/dashboard/leave/apply",
    "/dashboard/attendance",
    "/dashboard/approvals"
)

foreach ($page in $pages) {
    if (Test-Path "app$page\page.tsx") {
        Write-Host "  ✅ Found: app$page\page.tsx" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Missing: app$page\page.tsx" -ForegroundColor Red
    }
}

Write-Host "`nChecking UI Components..." -ForegroundColor Cyan
$components = @("textarea.tsx", "tabs.tsx", "card.tsx", "button.tsx")
foreach ($comp in $components) {
    if (Test-Path "components\ui\$comp") {
        Write-Host "  ✅ Found: components\ui\$comp" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Missing: components\ui\$comp" -ForegroundColor Red
    }
}

Write-Host "`n✅ VERIFICATION COMPLETE" -ForegroundColor Cyan
