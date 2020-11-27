<template>
  <div
    class="container mt-10 mx-auto px-6 py-4 rounded-lg shadow-lg bg-gray-300 space-y-4"
  >
    <div class="px-3 py-2 rounded shadow-xl bg-gray-500">
      <select v-model="selectedDevice" class="w-full">
        <option
          v-for="item in deviceObject"
          :key="item.deviceId"
          :value="item.deviceId"
        >
          {{ item.label }}
        </option>
      </select>
    </div>
    <div>
      <video ref="video"></video>
    </div>
    <div class="px-3 rounded py-2 shadow-lg bg-gray-500">
      {{ oResult }}
    </div>
  </div>
</template>

<script>
import { onMounted, ref, watch } from "vue";
import {
  BrowserQRCodeReader,
  NotFoundException,
  ChecksumException,
  FormatException,
} from "@zxing/library";

export default {
  name: "Home",
  setup() {
    const video = ref(null);
    const deviceObject = ref([]);
    const selectedDevice = ref("");
    const oResult = ref("");

    const codeReader = new BrowserQRCodeReader();

    codeReader.getVideoInputDevices().then((videoInputDevices) => {
      const videoData = [...videoInputDevices];
      deviceObject.value = videoData;
      if (videoData.length > 0) {
        selectedDevice.value = videoData[0].deviceId;
      }
    });

    const decodeCamera = (codeReader, deviceId, videoElement) => {
      codeReader.decodeFromInputVideoDeviceContinuously(
        deviceId,
        videoElement,
        (result, err) => {
          if (result) {
            oResult.value = result.text;
          }

          if (err) {
            if (err instanceof NotFoundException) {
              oResult.value = "No QR code found.";
            }

            if (err instanceof ChecksumException) {
              console.log(
                (oResult.value =
                  "A code was found, but it's read value was not valid.")
              );
            }

            if (err instanceof FormatException) {
              oResult.value =
                "A code was found, but it was in a invalid format.";
            }
          }
        }
      );
    };

    watch("selectedDevice", (val, old) => {
      if (old !== "") {
        codeReader.reset();
        decodeCamera(codeReader, selectedDevice.value, video.value);
      }
    });

    onMounted(() => {
      console.log(deviceObject.value);
      decodeCamera(codeReader, selectedDevice.value, video.value);
    });

    return { video, deviceObject, selectedDevice, oResult };
  },
};
</script>
