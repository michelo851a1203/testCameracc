<template>
  <div
    class="container mt-10 mx-auto px-6 py-4 rounded-lg shadow-lg bg-gray-300 space-y-4"
  >
    <div class="px-3 py-2 rounded shadow-xl bg-gray-500">
      <select
        v-if="deviceObject.length > 0 && noCameraRef"
        v-model="selectedDevice"
        class="w-full"
      >
        <option
          v-for="item in deviceObject"
          :key="item.deviceId"
          :value="item.deviceId"
        >
          {{ item.label }}
        </option>
      </select>
      <button
        v-else
        @click="callFile"
        class="px-3 py-2 w-full rounded-lg bg-blue-300 hover:bg-blue-500"
      >
        click
      </button>
    </div>
    <div>
      <video ref="video"></video>
      <img ref="imgRef" src="" />
    </div>
    <div class="px-3 rounded py-2 shadow-lg bg-gray-500">
      {{ oResult }}
    </div>
    <div class="hidden">
      <input
        ref="fileRef"
        @change="callReader"
        type="file"
        accept="image/*;capture=camera"
      />
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
    const imgRef = ref(null);
    const fileRef = ref(null);
    const deviceObject = ref([]);
    const selectedDevice = ref("");
    const oResult = ref("");
    const noCameraRef = ref(true);

    const codeReader = new BrowserQRCodeReader();

    codeReader.getVideoInputDevices().then((videoInputDevices) => {
      const videoData = [...videoInputDevices];
      deviceObject.value = videoData;
      if (videoData.length > 0) {
        selectedDevice.value = videoData[0].deviceId;
      }
    });

    const decodeCamera = (codeReader, deviceId, videoElement) => {
      codeReader
        .decodeFromInputVideoDeviceContinuously(
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
        )
        .catch((err) => {
          console.error(err);
          if (err && err.name === "NotAllowedError") {
            noCameraRef.value = false;
          }
        });
    };

    const callFile = () => {
      fileRef.value.click();
    };

    const callReader = (event) => {
      const files = event.target.files;
      if (files.length === 0) {
        return;
      }

      const type = files[0].type;
      if (type.indexOf("image/") > -1) {
        fileReaderToImage(files[0])
          .then(
            (img) =>
              new Promise((resolve, reject) => {
                if (typeof img !== "undefined" && img !== "") {
                  imgRef.value.src = img;
                  resolve(imgRef.value);
                } else {
                  reject("image error");
                }
              })
          )
          .then((element) => {
            console.log(element);
            return codeReader.decodeFromImage(element);
          })
          .then((result) => {
            if (result && result.text && result.text !== "") {
              oResult.value = result.text;
            }
          })
          .catch((err) => {
            console.error(err);
          });
      }

      if (type.indexOf("video/") > -1) {
        fileReaderToVideo(files[0])
          .then((video) => codeReader.decodeFromVideo(video))
          .then((qrcodeObject) => {
            if (!qrcodeObject || qrcodeObject.text === "") {
              oResult.value = "qrcodeObject and qrcodeObject.text is empty";
            }
            oResult.value = qrcodeObject.text;
          })
          .catch((err) => {
            console.error(err);
          });
      }
    };
    // imgRef
    const fileReaderToVideo = (file) =>
      new Promise((resove, reject) => {
        const reader = new FileReader();
        reader.readAsArrayBuffer(file);
        reader.onload = (event) => {
          const buffer = event.target.result;
          const videoBlob = new Blob([new Uint8Array(buffer)], {
            type: "video/mp4",
          });
          const url = window.URL.createObjectURL(videoBlob);
          video.value.src = url;
          resove(video.value);
        };
        reader.onerror = () => {
          reject("fileReader error");
        };
      });

    const fileReaderToImage = (file) =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject("onload fail");
      });

    watch("selectedDevice", (val, old) => {
      if (old !== "") {
        codeReader.reset();
        decodeCamera(codeReader, selectedDevice.value, video.value);
      }
    });

    onMounted(() => {
      decodeCamera(codeReader, selectedDevice.value, video.value);
    });

    return {
      video,
      imgRef,
      fileRef,
      deviceObject,
      selectedDevice,
      oResult,
      callFile,
      callReader,
      noCameraRef,
    };
  },
};
</script>
