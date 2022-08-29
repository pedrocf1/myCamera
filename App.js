// import { 
//   StyleSheet,
//   Text,
//   View,
//   SafeAreaView,
//   TouchableOpacity,
//   Modal,
//   Image
// } from 'react-native';

// import { Camera, CameraType } from 'expo-camera';
// import { useState, useEffect, useRef } from 'react';

// import { FontAwesome } from '@expo/vector-icons'

// export default function App() {
//   const camRef = useRef(null)
//   const [hasPermission, setHasPermission] = useState(null);
//   const [type, setType] = useState(CameraType.back);
//   const [capturedPhoto, setCapturedPhoto] = useState()
//   const [open, setOpen] = useState(false)

//   useEffect(() => {
//     (async () => {
//       const { status } = await Camera.requestCameraPermissionsAsync();
//       setHasPermission(status === 'granted');
//     })();
//   }, []);

//   if (hasPermission === null) {
//     return <View />;
//   }
//   if (hasPermission === false) {
//     return <Text>No access to camera</Text>;
//   }

//   async function takePicture() {
//     if(camRef){
//       const data = await camRef.current.takePictureAsync()
//       setCapturedPhoto(data.uri)
//       setOpen(true)
//     }
//   }

//   return (
//     <View style={styles.container}>
//       <Camera 
//         style={styles.camera}
//         type={type}
//         ref={camRef}
//       >
//         <View style={styles.contentButtons}>
//           <TouchableOpacity
//             style={styles.buttonFlip}
//             onPress={() => {
//               setType(type === CameraType.back ? CameraType.front : CameraType.back);
//             }}>
//             <FontAwesome name="exchange" size={23} color="red"></FontAwesome>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={styles.buttonCamera}
//             onPress={takePicture}
//           >
//             <FontAwesome name="camera" size={23} color="#fff"></FontAwesome>
//           </TouchableOpacity>
//         </View>
//       </Camera>
//       {
//         capturedPhoto && 
//         (
//           <Modal
//             animationType='slide'
//             transparent={true}
//             visible={open}
//           >
//             <View style={styles.contentModal}>
//             <TouchableOpacity
//               style={styles.closeButton}
//               onPress={() => {setOpen(false)}}
//             >
//               <FontAwesome name="close" size={50} color="#fff"></FontAwesome>
//             </TouchableOpacity>
//               <Image
//                 style={styles.imgPhoto}
//                 source={{uri: capturedPhoto}}
//               />
//             </View>
//           </Modal>
//         )
//       }
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//   },
//   camera: {
//     width: '100%',
//     height: '100%'
//   },
//   contentButtons: {
//     flex: 1,
//     backgroundColor: 'transparent',
//     flexDirection: 'row'
//   },
//   buttonFlip: {
//     position: 'absolute',
//     bottom: 50,
//     left: 30,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//     margin: 20,
//     height: 50,
//     width: 50,
//     borderRadius: 50,
//   },
//   buttonCamera:{
//     position: 'absolute',
//     bottom: 50,
//     right: 30,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'red',
//     margin: 20,
//     height: 50,
//     width: 50,
//     borderRadius: 50,
//   },
//   contentModal: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'flex-end',
//     margin: 20,
//   },
//   closeButton: {
//     position: 'absolute',
//     top: 10,
//     left: 2,
//     margin: 10,
//   },
//   imgPhoto: {
//     width: '100%',
//     height: 400,
//   }
// });


import Slider from "@react-native-community/slider";
import { Camera } from "expo-camera";
import * as MediaLibrary from "expo-media-library";
import * as Permissions from "expo-permissions";
import { MEDIA_LIBRARY } from "expo-permissions";
import React, { useEffect, useReducer, useRef, useState } from "react";
import {
  Dimensions,
  ScrollView,
  StatusBar,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import IconButton from "./src/components/iconButton";
const { width: wWidth, height: wHeight } = Dimensions.get("window");

const whiteBlcProps = [
  { id: "auto", property: "Auto" },
  { id: "sunny", property: "Sunny" },
  { id: "cloudy", property: "Cloudy" },
  { id: "shadow", property: "Shadow" },
  { id: "incandescent", property: "Incandescent" },
  { id: "fluorescent", property: "Fluorescent" },
];

const initialState = {
  whbalance: "auto",
  cameraType: "back",
  flash: "off",
  zoomValue: 0,
};
function reducer(state = initialState, action) {
  console.log("action", action)
  switch (action.type) {
    case "@type/WH_BALANCE":
      return { ...state, whbalance: action.payload };
    case "@type/CAMERA_BACK":
      return { ...state, cameraType: action.payload };
    case "@type/CAMERA_FRONT":
      return { ...state, cameraType: action.payload };
    case "@type/FLASH":
      return { ...state, flash: action.payload };
    case "@type/ZOOM":
      return {
        ...state,
        zoomValue: action.payload,
      };
    default:
      return { ...state };
  }
}

export default function App() {
  const [hasPermission, setHasPermission] = useState(null);
  // Use Reducer
  const [state, dispatch] = useReducer(reducer, initialState);
  const { cameraType, whbalance, flash, zoomValue } = state;

  const cam = useRef();

  const _takePicture = async () => {
    if (cam.current) {
      const options = { quality: 0.5, base64: true, skipProcessing: true };
      let photo = await cam.current.takePictureAsync(options);

      //console.log(cam.current.getSupportedRatiosAsync());

      const source = photo.uri;
      cam.current.pausePreview();
      await handleSave(source);
      cam.current.resumePreview();
    }
  };

  const handleSave = async (photo) => {
    const { status } = await Permissions.askAsync(MEDIA_LIBRARY);
    if (status === "granted") {
      const assert = await MediaLibrary.createAssetAsync(photo);
      const album = await MediaLibrary.getAlbumAsync("casa bonita");
      console.log("albuim", album)
      if(album != null){
        const result = await MediaLibrary.addAssetsToAlbumAsync(assert, album.id, false)
        console.log("result", result)
      }else{
        const result = await MediaLibrary.createAlbumAsync("casa bonita", assert, false);
        // create album
        console.log("result", result)
      }
    } else {
      console.log("Oh You Missed to give permission");
    }
  };

  const _handleCameraToggle = () => {
    if (cameraType === "back") {
      dispatch({
        type: "@type/CAMERA_FRONT",
        payload: "front",
      });
    } else {
      dispatch({
        type: "@type/CAMERA_BACK",
        payload: "back",
      });
    }
  };

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  const _toggleFlash = () => {
    if (flash === "off") {
      dispatch({
        type: "@type/FLASH",
        payload: "on",
      });
    } else {
      dispatch({
        type: "@type/FLASH",
        payload: "off",
      });
    }
  };

  const _zoomEffect = (value) => {
    dispatch({
      type: "@type/ZOOM",
      payload: value,
    });
  };

  const _handleWhiteBalance = (value) => {
    if (value.length > 0) {
      dispatch({
        type: "@type/WH_BALANCE",
        payload: value,
      });
    }
  };

  //console.log(cam.current);
  return (
    <View style={{ flex: 1 }}>
      <StatusBar />
      <Camera
        zoom={zoomValue}
        whiteBalance={whbalance}
        flashMode={flash}
        ref={cam}
        style={{ flex: 1 }}
        type={cameraType}
      >
        <View
          style={{
            backgroundColor: "black",
            width: wWidth,
            height: wHeight * 0.1,
            paddingTop: 20
          }}
        >
          <View style={{ padding: 20 }}>
            <ScrollView>
              <IconButton
                icon={flash === "on" ? "zap" : "zap-off"}
                onPress={_toggleFlash}
              />
            </ScrollView>
          </View>
        </View>
        <View
          style={{
            position: "relative",
            top: 450,
            width: wWidth,
          }}
        >
          <Slider
            onValueChange={_zoomEffect}
            style={{
              width: 300,
              height: 80,
              left: 5,
              top: 100
            }}
            minimumValue={0}
            maximumValue={1}
            minimumTrackTintColor="#FFFFFF"
            maximumTrackTintColor="#000000"
          />
        </View>

        <View
          style={{
            position: "absolute",
            bottom: 0,
            backgroundColor: "black",
            width: wWidth,
            opacity: 0.5,
            height: wHeight * 0.2
          }}
        >
          <View
            style={{
              flexDirection: "column",
              justifyContent: "center",
              width: wWidth,
            }}
          >
            <View
              style={{
                width: wWidth,
                alignItems: "center",
              }}
            >
              <ScrollView horizontal={true}>
                {whiteBlcProps.map((wb, _) => {
                  return (
                    <TouchableWithoutFeedback
                      onPress={() => _handleWhiteBalance(wb.id)}
                      key={wb.id}
                    >
                      <View style={{ padding: 10 }}>
                        <Text style={{ color: "white" }}>{wb.property}</Text>
                      </View>
                    </TouchableWithoutFeedback>
                  );
                })}
              </ScrollView>
            </View>
            <View
              style={{
                padding: 20,
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <IconButton icon="refresh-cw" onPress={_handleCameraToggle} />
              <IconButton icon="camera" size={50} onPress={_takePicture} />
              <IconButton icon="grid" onPress={() => true} />
            </View>
          </View>
        </View>
      </Camera>
    </View>
  );
}