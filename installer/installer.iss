; Inno Setup script — Dispatch4you Chrome extension installer.
; Builds Dispatch4you-Setup.exe. Per-user, NO admin rights required.
;
; What it does: writes one Chrome enterprise-policy registry value that tells
; Chrome to force-install our extension from our self-hosted update manifest.
; The .crx itself is NOT bundled — Chrome downloads it from the update_url.
;
; Build: open this file in Inno Setup and press Compile (or iscc installer.iss).

#define AppName       "Dispatch4you для DAT"
#define AppPublisher  "Dispatch4you.com"
#define AppVersion    "1.0.0"
#define ExtId         "ahbjapbcfgplnnjempddicmohpbdloin"
#define UpdateUrl     "https://dispatch4you.com/ext/update.xml"

[Setup]
AppId={{C2F4A1E0-7C2B-4E2A-9D3F-D4Y0DAT00001}
AppName={#AppName}
AppVersion={#AppVersion}
AppPublisher={#AppPublisher}
DefaultDirName={localappdata}\Dispatch4you
DisableDirPage=yes
DisableProgramGroupPage=yes
CreateAppDir=no
PrivilegesRequired=lowest
OutputDir=.
OutputBaseFilename=Dispatch4you-Setup
Compression=lzma2
SolidCompression=yes
WizardStyle=modern
UninstallDisplayName={#AppName}

[Languages]
Name: "ru"; MessagesFile: "compiler:Languages\Russian.isl"

[Registry]
; Chrome force-install list (per-user). Value name "1" = "<id>;<update_url>".
Root: HKCU; Subkey: "Software\Policies\Google\Chrome"; Flags: uninsdeletekeyifempty
Root: HKCU; Subkey: "Software\Policies\Google\Chrome\ExtensionInstallForcelist"; Flags: uninsdeletekeyifempty
Root: HKCU; Subkey: "Software\Policies\Google\Chrome\ExtensionInstallForcelist"; \
    ValueType: string; ValueName: "1"; ValueData: "{#ExtId};{#UpdateUrl}"; \
    Flags: uninsdeletevalue

[Code]
procedure CurStepChanged(CurStep: TSetupStep);
begin
  if CurStep = ssPostInstall then
    MsgBox('Расширение установлено.' + #13#10#13#10 +
           'Закройте и снова откройте Google Chrome — расширение появится ' +
           'автоматически и заработает на one.dat.com.',
           mbInformation, MB_OK);
end;
