# https://github.com/electron-userland/electron-builder/issues/1145#issuecomment-281197151

#!ifndef BUILD_UNINSTALLER
#  Function AddToStartup
#    CreateShortCut "$SMSTARTUP\arztcloud Desktop Client.lnk" "$INSTDIR\arztcloud Desktop Client.exe" ""
#  FunctionEnd

#  ; Using the read me setting as an easy way to add an add to startup option
#  !define MUI_FINISHPAGE_SHOWREADME
#  !define MUI_FINISHPAGE_SHOWREADME_TEXT "Run at startup"
#  !define MUI_FINISHPAGE_SHOWREADME_FUNCTION AddToStartup
#!endif

#!macro customUnInstall
#  Delete "$SMSTARTUP\arztcloud-dc.lnk"
#!macroend

# https://github.com/electron-archive/grunt-electron-installer/issues/115#issuecomment-357163350

!macro customInstall
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Run" "arztcloud Desktop Client" "$INSTDIR\arztcloud Desktop Client.exe"
!macroend

!macro customUnInstall
  DeleteRegValue HKLM "Software\Microsoft\Windows\CurrentVersion\Run" "arztcloud Desktop Client"
!macroend
