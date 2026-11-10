# Run in PowerShell from the raffah project directory while the server is stopped.
# Does not delete patients, visits, or existing accounts.
$ErrorActionPreference = 'Stop'
$accounts = @(
    @{ Role='nurse'; Email='reef112@gmail.com' },
    @{ Role='doctor'; Email='ahmed112@gmail.com' },
    @{ Role='reception'; Email='sa112@gmail.com' }
)
foreach ($account in $accounts) {
    Write-Host "Set password for $($account.Role) / $($account.Email)" -ForegroundColor Cyan
    $secure = Read-Host 'Password (7+ characters)' -AsSecureString
    $ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
    try {
        $env:RAFFAH_NEW_PASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr)
        if ($env:RAFFAH_NEW_PASSWORD.Length -lt 7) { throw 'Password must contain at least 7 characters.' }
        node manage-staff.mjs $account.Role $account.Email
        if ($LASTEXITCODE -ne 0) { throw "Failed to configure $($account.Email)" }
    } finally {
        Remove-Item Env:RAFFAH_NEW_PASSWORD -ErrorAction SilentlyContinue
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)
    }
}
Write-Host 'Accounts updated. Restart the app with npm start.' -ForegroundColor Green
