/**
 * Centralized blocklist of process names and virtual camera device identifiers.
 * Keep entries lowercase — comparisons are always case-insensitive.
 */

const faceSwapping = [
  'deepfacelive',
  'deepfacelab',
  'facefusion',
  'simswap',
  'roop',
  'faceswap',
  'ghost',
  'avatarify',
  'myswap',
  'swapface',
  'deepswap',
  'reface',
  'fomm',
  'first-order-model',
]

const virtualCameras = [
  'obs',
  'obs64',
  'obs32',
  'manycam',
  'snap_camera',
  'snap camera',
  'xsplit',
  'xsplitbroadcaster',
  'splitcam',
  'youcam',
  'mmemulation',
  'e2eSoft',
  'droidcam',
  'iriun',
  'epoccam',
  'camo',
  'prism live',
  'chromacam',
  'vcam',
  'virtualcam',
  'akvcam',
  'v4l2loopback',
]

const screenSharing = [
  'teamviewer',
  'anydesk',
  'vnc',
  'tightvnc',
  'ultravnc',
  'realvnc',
  'rustdesk',
  'parsec',
  'splashtop',
  'chrome remote desktop',
  'chromeremotedesktop',
  'getscreen',
  'remotepc',
  'screenconnect',
  'connectwise',
  'logmein',
  'bomgar',
]

const screenRecording = [
  'bandicam',
  'camtasia',
  'screenrec',
  'sharex',
  'loom',
  'screenpal',
  'screencastify',
  'flashback',
  'icecreamscreenrecorder',
  'apowerrec',
  'recordcast',
]

const virtualMachines = [
  'vmware',
  'virtualbox',
  'vboxservice',
  'vboxtray',
  'qemu',
  'hyperv',
  'vmtoolsd',
  'vmwaretray',
  'parallels',
]

const virtualCameraDeviceNames = [
  'obs virtual camera',
  'obs-camera',
  'manycam virtual webcam',
  'snap camera',
  'xsplit vcam',
  'splitcam video driver',
  'youcam',
  'e2esoft vcam',
  'droidcam source',
  'iriun webcam',
  'epoccam camera',
  'camo',
  'chromacam',
  'newtek ndi video',
  'prism live studio',
  'virtual camera',
  'akvcam',
]

const allProcesses = [
  ...faceSwapping,
  ...virtualCameras,
  ...screenSharing,
  ...screenRecording,
  ...virtualMachines,
]

module.exports = {
  faceSwapping,
  virtualCameras,
  screenSharing,
  screenRecording,
  virtualMachines,
  virtualCameraDeviceNames,
  allProcesses,
}
