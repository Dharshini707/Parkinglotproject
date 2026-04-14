import { useState, useRef, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  RiSearchLine, RiFilterLine, RiMapPin2Line, RiCloseLine,
  RiFlashlightLine, RiMoonLine, RiArrowRightLine,
  RiLoader4Line, RiParkingLine, RiNavigationLine,
} from 'react-icons/ri'
import toast from 'react-hot-toast'
import { Map, MapMarker, MarkerContent, MapPopup, MapControls } from '../components/ui/map'

// ── All demo lots spread across India ────────────────────────────────────────
const ALL_LOTS = [
  { _id:'1', name:"Visakhapatnam City Parking", address:"Visakhapatnam, Andhra Pradesh", lat:17.692377, lng:83.1995, availableSpots:7, occupiedSpots:23, totalSpots:30, pricePerHour:30, type:"open", amenities:["ev"], rating:3.7, state:"Andhra Pradesh", district:"Visakhapatnam" },
  { _id:'2', name:"Visakhapatnam Municipal Parking", address:"Visakhapatnam, Andhra Pradesh", lat:17.6709, lng:83.228127, availableSpots:5, occupiedSpots:45, totalSpots:50, pricePerHour:100, type:"basement", amenities:["24h"], rating:4.1, state:"Andhra Pradesh", district:"Visakhapatnam" },
  { _id:'3', name:"Visakhapatnam Station Parking", address:"Visakhapatnam, Andhra Pradesh", lat:17.667992, lng:83.207246, availableSpots:38, occupiedSpots:12, totalSpots:50, pricePerHour:15, type:"covered", amenities:[], rating:4.3, state:"Andhra Pradesh", district:"Visakhapatnam" },
  { _id:'4', name:"Vijayawada Commercial Parking", address:"Vijayawada, Andhra Pradesh", lat:16.514841, lng:80.656053, availableSpots:14, occupiedSpots:26, totalSpots:40, pricePerHour:60, type:"open", amenities:["24h"], rating:4.4, state:"Andhra Pradesh", district:"Vijayawada" },
  { _id:'5', name:"Vijayawada Market Parking", address:"Vijayawada, Andhra Pradesh", lat:16.518577, lng:80.62826, availableSpots:22, occupiedSpots:3, totalSpots:25, pricePerHour:50, type:"basement", amenities:["ev", "24h"], rating:4.0, state:"Andhra Pradesh", district:"Vijayawada" },
  { _id:'6', name:"Vijayawada Mall Parking", address:"Vijayawada, Andhra Pradesh", lat:16.492419, lng:80.666289, availableSpots:3, occupiedSpots:27, totalSpots:30, pricePerHour:20, type:"covered", amenities:[], rating:4.1, state:"Andhra Pradesh", district:"Vijayawada" },
  { _id:'7', name:"Guntur Metro Parking", address:"Guntur, Andhra Pradesh", lat:16.301059, lng:80.430258, availableSpots:25, occupiedSpots:5, totalSpots:30, pricePerHour:15, type:"open", amenities:["ev", "24h"], rating:4.6, state:"Andhra Pradesh", district:"Guntur" },
  { _id:'8', name:"Guntur Business District Parking", address:"Guntur, Andhra Pradesh", lat:16.308149, lng:80.455425, availableSpots:5, occupiedSpots:35, totalSpots:40, pricePerHour:80, type:"basement", amenities:["ev"], rating:3.9, state:"Andhra Pradesh", district:"Guntur" },
  { _id:'9', name:"Guntur Town Hall Parking", address:"Guntur, Andhra Pradesh", lat:16.311846, lng:80.451918, availableSpots:18, occupiedSpots:12, totalSpots:30, pricePerHour:30, type:"covered", amenities:["24h"], rating:4.6, state:"Andhra Pradesh", district:"Guntur" },
  { _id:'10', name:"Nellore Junction Parking", address:"Nellore, Andhra Pradesh", lat:14.424433, lng:79.975616, availableSpots:2, occupiedSpots:28, totalSpots:30, pricePerHour:30, type:"open", amenities:[], rating:4.8, state:"Andhra Pradesh", district:"Nellore" },
  { _id:'11', name:"Nellore Bus Stand Parking", address:"Nellore, Andhra Pradesh", lat:14.437805, lng:79.984636, availableSpots:5, occupiedSpots:25, totalSpots:30, pricePerHour:40, type:"basement", amenities:["24h"], rating:4.0, state:"Andhra Pradesh", district:"Nellore" },
  { _id:'12', name:"Nellore Civic Center Parking", address:"Nellore, Andhra Pradesh", lat:14.449407, lng:79.994573, availableSpots:19, occupiedSpots:1, totalSpots:20, pricePerHour:25, type:"covered", amenities:["ev", "24h"], rating:4.3, state:"Andhra Pradesh", district:"Nellore" },
  { _id:'13', name:"Tirupati Railway Station Parking", address:"Tirupati, Andhra Pradesh", lat:13.618592, lng:79.41769, availableSpots:29, occupiedSpots:1, totalSpots:30, pricePerHour:80, type:"open", amenities:[], rating:3.8, state:"Andhra Pradesh", district:"Tirupati" },
  { _id:'14', name:"Tirupati Central Parking", address:"Tirupati, Andhra Pradesh", lat:13.621771, lng:79.429933, availableSpots:7, occupiedSpots:13, totalSpots:20, pricePerHour:15, type:"basement", amenities:["ev", "24h"], rating:4.7, state:"Andhra Pradesh", district:"Tirupati" },
  { _id:'15', name:"Tirupati Smart Parking Hub", address:"Tirupati, Andhra Pradesh", lat:13.624847, lng:79.401848, availableSpots:45, occupiedSpots:5, totalSpots:50, pricePerHour:40, type:"covered", amenities:["ev"], rating:3.8, state:"Andhra Pradesh", district:"Tirupati" },
  { _id:'16', name:"Kurnool City Parking", address:"Kurnool, Andhra Pradesh", lat:15.828069, lng:78.052687, availableSpots:9, occupiedSpots:31, totalSpots:40, pricePerHour:35, type:"open", amenities:["24h"], rating:3.7, state:"Andhra Pradesh", district:"Kurnool" },
  { _id:'17', name:"Kurnool Municipal Parking", address:"Kurnool, Andhra Pradesh", lat:15.8379, lng:78.038859, availableSpots:27, occupiedSpots:23, totalSpots:50, pricePerHour:100, type:"basement", amenities:[], rating:4.1, state:"Andhra Pradesh", district:"Kurnool" },
  { _id:'18', name:"Kurnool Station Parking", address:"Kurnool, Andhra Pradesh", lat:15.816873, lng:78.057202, availableSpots:31, occupiedSpots:19, totalSpots:50, pricePerHour:20, type:"covered", amenities:["24h"], rating:4.6, state:"Andhra Pradesh", district:"Kurnool" },
  { _id:'19', name:"Kakinada Commercial Parking", address:"Kakinada, Andhra Pradesh", lat:17.003544, lng:82.233614, availableSpots:25, occupiedSpots:0, totalSpots:25, pricePerHour:50, type:"open", amenities:["ev", "24h"], rating:4.4, state:"Andhra Pradesh", district:"Kakinada" },
  { _id:'20', name:"Kakinada Market Parking", address:"Kakinada, Andhra Pradesh", lat:16.984491, lng:82.251336, availableSpots:33, occupiedSpots:7, totalSpots:40, pricePerHour:35, type:"basement", amenities:[], rating:5.0, state:"Andhra Pradesh", district:"Kakinada" },
  { _id:'21', name:"Itanagar Market Parking", address:"Itanagar, Arunachal Pradesh", lat:27.098831, lng:93.585759, availableSpots:17, occupiedSpots:3, totalSpots:20, pricePerHour:35, type:"covered", amenities:["ev", "24h"], rating:4.7, state:"Arunachal Pradesh", district:"Itanagar" },
  { _id:'22', name:"Itanagar Mall Parking", address:"Itanagar, Arunachal Pradesh", lat:27.078007, lng:93.59704, availableSpots:14, occupiedSpots:11, totalSpots:25, pricePerHour:15, type:"open", amenities:["ev"], rating:4.9, state:"Arunachal Pradesh", district:"Itanagar" },
  { _id:'23', name:"Itanagar Junction Parking", address:"Itanagar, Arunachal Pradesh", lat:27.099434, lng:93.595836, availableSpots:48, occupiedSpots:2, totalSpots:50, pricePerHour:25, type:"basement", amenities:["24h"], rating:4.3, state:"Arunachal Pradesh", district:"Itanagar" },
  { _id:'24', name:"Naharlagun Business District Parking", address:"Naharlagun, Arunachal Pradesh", lat:27.088856, lng:93.699812, availableSpots:38, occupiedSpots:12, totalSpots:50, pricePerHour:30, type:"covered", amenities:[], rating:3.7, state:"Arunachal Pradesh", district:"Naharlagun" },
  { _id:'25', name:"Naharlagun Town Hall Parking", address:"Naharlagun, Arunachal Pradesh", lat:27.1151, lng:93.696375, availableSpots:0, occupiedSpots:50, totalSpots:50, pricePerHour:100, type:"open", amenities:["24h"], rating:4.0, state:"Arunachal Pradesh", district:"Naharlagun" },
  { _id:'26', name:"Naharlagun Railway Station Parking", address:"Naharlagun, Arunachal Pradesh", lat:27.085379, lng:93.711964, availableSpots:7, occupiedSpots:23, totalSpots:30, pricePerHour:15, type:"basement", amenities:["ev", "24h"], rating:3.9, state:"Arunachal Pradesh", district:"Naharlagun" },
  { _id:'27', name:"Pasighat Bus Stand Parking", address:"Pasighat, Arunachal Pradesh", lat:28.068494, lng:95.30895, availableSpots:4, occupiedSpots:36, totalSpots:40, pricePerHour:80, type:"covered", amenities:[], rating:4.6, state:"Arunachal Pradesh", district:"Pasighat" },
  { _id:'28', name:"Pasighat Civic Center Parking", address:"Pasighat, Arunachal Pradesh", lat:28.050936, lng:95.324811, availableSpots:10, occupiedSpots:40, totalSpots:50, pricePerHour:35, type:"open", amenities:["ev", "24h"], rating:4.3, state:"Arunachal Pradesh", district:"Pasighat" },
  { _id:'29', name:"Pasighat City Parking", address:"Pasighat, Arunachal Pradesh", lat:28.070064, lng:95.344375, availableSpots:48, occupiedSpots:2, totalSpots:50, pricePerHour:30, type:"basement", amenities:["ev"], rating:4.6, state:"Arunachal Pradesh", district:"Pasighat" },
  { _id:'30', name:"Ziro Central Parking", address:"Ziro, Arunachal Pradesh", lat:27.52896, lng:93.833567, availableSpots:14, occupiedSpots:16, totalSpots:30, pricePerHour:80, type:"covered", amenities:["24h"], rating:4.2, state:"Arunachal Pradesh", district:"Ziro" },
  { _id:'31', name:"Ziro Smart Parking Hub", address:"Ziro, Arunachal Pradesh", lat:27.522916, lng:93.809261, availableSpots:18, occupiedSpots:2, totalSpots:20, pricePerHour:80, type:"open", amenities:[], rating:3.8, state:"Arunachal Pradesh", district:"Ziro" },
  { _id:'32', name:"Ziro Commercial Parking", address:"Ziro, Arunachal Pradesh", lat:27.521809, lng:93.80954, availableSpots:7, occupiedSpots:13, totalSpots:20, pricePerHour:20, type:"basement", amenities:["24h"], rating:4.9, state:"Arunachal Pradesh", district:"Ziro" },
  { _id:'33', name:"Itanagar Municipal Parking", address:"Itanagar, Arunachal Pradesh", lat:27.098785, lng:93.588134, availableSpots:8, occupiedSpots:17, totalSpots:25, pricePerHour:60, type:"covered", amenities:["ev", "24h"], rating:3.8, state:"Arunachal Pradesh", district:"Itanagar" },
  { _id:'34', name:"Itanagar Station Parking", address:"Itanagar, Arunachal Pradesh", lat:27.069692, lng:93.622721, availableSpots:36, occupiedSpots:14, totalSpots:50, pricePerHour:60, type:"open", amenities:[], rating:3.9, state:"Arunachal Pradesh", district:"Itanagar" },
  { _id:'35', name:"Itanagar Metro Parking", address:"Itanagar, Arunachal Pradesh", lat:27.083319, lng:93.601582, availableSpots:3, occupiedSpots:17, totalSpots:20, pricePerHour:50, type:"basement", amenities:["ev", "24h"], rating:4.0, state:"Arunachal Pradesh", district:"Itanagar" },
  { _id:'36', name:"Naharlagun Market Parking", address:"Naharlagun, Arunachal Pradesh", lat:27.101044, lng:93.709353, availableSpots:20, occupiedSpots:0, totalSpots:20, pricePerHour:20, type:"covered", amenities:["ev"], rating:3.6, state:"Arunachal Pradesh", district:"Naharlagun" },
  { _id:'37', name:"Naharlagun Mall Parking", address:"Naharlagun, Arunachal Pradesh", lat:27.113729, lng:93.706824, availableSpots:7, occupiedSpots:13, totalSpots:20, pricePerHour:30, type:"open", amenities:["24h"], rating:3.8, state:"Arunachal Pradesh", district:"Naharlagun" },
  { _id:'38', name:"Naharlagun Junction Parking", address:"Naharlagun, Arunachal Pradesh", lat:27.102545, lng:93.691675, availableSpots:14, occupiedSpots:16, totalSpots:30, pricePerHour:30, type:"basement", amenities:[], rating:4.8, state:"Arunachal Pradesh", district:"Naharlagun" },
  { _id:'39', name:"Pasighat Business District Parking", address:"Pasighat, Arunachal Pradesh", lat:28.048815, lng:95.338121, availableSpots:6, occupiedSpots:44, totalSpots:50, pricePerHour:15, type:"covered", amenities:["24h"], rating:4.5, state:"Arunachal Pradesh", district:"Pasighat" },
  { _id:'40', name:"Pasighat Town Hall Parking", address:"Pasighat, Arunachal Pradesh", lat:28.067424, lng:95.30639, availableSpots:7, occupiedSpots:13, totalSpots:20, pricePerHour:25, type:"open", amenities:["ev", "24h"], rating:4.1, state:"Arunachal Pradesh", district:"Pasighat" },
  { _id:'41', name:"Guwahati Town Hall Parking", address:"Guwahati, Assam", lat:26.143754, lng:91.750786, availableSpots:5, occupiedSpots:15, totalSpots:20, pricePerHour:50, type:"basement", amenities:[], rating:3.5, state:"Assam", district:"Guwahati" },
  { _id:'42', name:"Guwahati Railway Station Parking", address:"Guwahati, Assam", lat:26.140117, lng:91.753261, availableSpots:18, occupiedSpots:22, totalSpots:40, pricePerHour:50, type:"covered", amenities:["ev", "24h"], rating:4.5, state:"Assam", district:"Guwahati" },
  { _id:'43', name:"Guwahati Central Parking", address:"Guwahati, Assam", lat:26.15372, lng:91.747534, availableSpots:9, occupiedSpots:31, totalSpots:40, pricePerHour:30, type:"open", amenities:["ev"], rating:3.9, state:"Assam", district:"Guwahati" },
  { _id:'44', name:"Silchar Civic Center Parking", address:"Silchar, Assam", lat:24.852048, lng:92.782067, availableSpots:3, occupiedSpots:47, totalSpots:50, pricePerHour:40, type:"basement", amenities:["24h"], rating:3.6, state:"Assam", district:"Silchar" },
  { _id:'45', name:"Silchar City Parking", address:"Silchar, Assam", lat:24.836667, lng:92.779014, availableSpots:10, occupiedSpots:40, totalSpots:50, pricePerHour:15, type:"covered", amenities:[], rating:4.9, state:"Assam", district:"Silchar" },
  { _id:'46', name:"Silchar Municipal Parking", address:"Silchar, Assam", lat:24.816504, lng:92.766333, availableSpots:4, occupiedSpots:46, totalSpots:50, pricePerHour:30, type:"open", amenities:["24h"], rating:4.1, state:"Assam", district:"Silchar" },
  { _id:'47', name:"Dibrugarh Smart Parking Hub", address:"Dibrugarh, Assam", lat:27.490464, lng:94.914787, availableSpots:38, occupiedSpots:12, totalSpots:50, pricePerHour:15, type:"basement", amenities:["ev", "24h"], rating:4.4, state:"Assam", district:"Dibrugarh" },
  { _id:'48', name:"Dibrugarh Commercial Parking", address:"Dibrugarh, Assam", lat:27.469569, lng:94.915347, availableSpots:20, occupiedSpots:30, totalSpots:50, pricePerHour:35, type:"covered", amenities:[], rating:3.8, state:"Assam", district:"Dibrugarh" },
  { _id:'49', name:"Dibrugarh Market Parking", address:"Dibrugarh, Assam", lat:27.481448, lng:94.901547, availableSpots:8, occupiedSpots:32, totalSpots:40, pricePerHour:35, type:"open", amenities:["ev", "24h"], rating:4.2, state:"Assam", district:"Dibrugarh" },
  { _id:'50', name:"Jorhat Station Parking", address:"Jorhat, Assam", lat:26.768061, lng:94.221129, availableSpots:14, occupiedSpots:6, totalSpots:20, pricePerHour:100, type:"basement", amenities:["ev"], rating:5.0, state:"Assam", district:"Jorhat" },
  { _id:'51', name:"Jorhat Metro Parking", address:"Jorhat, Assam", lat:26.770744, lng:94.18663, availableSpots:16, occupiedSpots:9, totalSpots:25, pricePerHour:35, type:"covered", amenities:["24h"], rating:3.7, state:"Assam", district:"Jorhat" },
  { _id:'52', name:"Jorhat Business District Parking", address:"Jorhat, Assam", lat:26.74486, lng:94.186452, availableSpots:11, occupiedSpots:14, totalSpots:25, pricePerHour:35, type:"open", amenities:[], rating:3.7, state:"Assam", district:"Jorhat" },
  { _id:'53', name:"Tezpur Mall Parking", address:"Tezpur, Assam", lat:26.64715, lng:92.800942, availableSpots:41, occupiedSpots:9, totalSpots:50, pricePerHour:80, type:"basement", amenities:["24h"], rating:3.5, state:"Assam", district:"Tezpur" },
  { _id:'54', name:"Tezpur Junction Parking", address:"Tezpur, Assam", lat:26.646484, lng:92.784775, availableSpots:4, occupiedSpots:16, totalSpots:20, pricePerHour:35, type:"covered", amenities:["ev", "24h"], rating:3.7, state:"Assam", district:"Tezpur" },
  { _id:'55', name:"Tezpur Bus Stand Parking", address:"Tezpur, Assam", lat:26.618081, lng:92.794929, availableSpots:9, occupiedSpots:21, totalSpots:30, pricePerHour:100, type:"open", amenities:[], rating:3.8, state:"Assam", district:"Tezpur" },
  { _id:'56', name:"Nagaon Town Hall Parking", address:"Nagaon, Assam", lat:26.340315, lng:92.6911, availableSpots:16, occupiedSpots:14, totalSpots:30, pricePerHour:60, type:"basement", amenities:["ev", "24h"], rating:3.9, state:"Assam", district:"Nagaon" },
  { _id:'57', name:"Nagaon Railway Station Parking", address:"Nagaon, Assam", lat:26.362926, lng:92.665632, availableSpots:17, occupiedSpots:23, totalSpots:40, pricePerHour:15, type:"covered", amenities:["ev"], rating:3.5, state:"Assam", district:"Nagaon" },
  { _id:'58', name:"Nagaon Central Parking", address:"Nagaon, Assam", lat:26.357445, lng:92.689085, availableSpots:5, occupiedSpots:25, totalSpots:30, pricePerHour:60, type:"open", amenities:["24h"], rating:4.3, state:"Assam", district:"Nagaon" },
  { _id:'59', name:"Bongaigaon Civic Center Parking", address:"Bongaigaon, Assam", lat:26.474407, lng:90.538487, availableSpots:4, occupiedSpots:16, totalSpots:20, pricePerHour:80, type:"basement", amenities:[], rating:3.6, state:"Assam", district:"Bongaigaon" },
  { _id:'60', name:"Bongaigaon City Parking", address:"Bongaigaon, Assam", lat:26.472069, lng:90.560201, availableSpots:8, occupiedSpots:32, totalSpots:40, pricePerHour:15, type:"covered", amenities:["24h"], rating:4.0, state:"Assam", district:"Bongaigaon" },
  { _id:'61', name:"Patna City Parking", address:"Patna, Bihar", lat:25.610059, lng:85.149445, availableSpots:11, occupiedSpots:9, totalSpots:20, pricePerHour:30, type:"open", amenities:["ev", "24h"], rating:4.5, state:"Bihar", district:"Patna" },
  { _id:'62', name:"Patna Municipal Parking", address:"Patna, Bihar", lat:25.600777, lng:85.131747, availableSpots:26, occupiedSpots:24, totalSpots:50, pricePerHour:100, type:"basement", amenities:[], rating:4.6, state:"Bihar", district:"Patna" },
  { _id:'63', name:"Patna Station Parking", address:"Patna, Bihar", lat:25.611131, lng:85.127069, availableSpots:25, occupiedSpots:0, totalSpots:25, pricePerHour:25, type:"covered", amenities:["ev", "24h"], rating:4.8, state:"Bihar", district:"Patna" },
  { _id:'64', name:"Gaya Commercial Parking", address:"Gaya, Bihar", lat:24.772391, lng:85.008863, availableSpots:25, occupiedSpots:5, totalSpots:30, pricePerHour:50, type:"open", amenities:["ev"], rating:4.7, state:"Bihar", district:"Gaya" },
  { _id:'65', name:"Gaya Market Parking", address:"Gaya, Bihar", lat:24.805963, lng:85.01183, availableSpots:5, occupiedSpots:25, totalSpots:30, pricePerHour:20, type:"basement", amenities:["24h"], rating:4.1, state:"Bihar", district:"Gaya" },
  { _id:'66', name:"Gaya Mall Parking", address:"Gaya, Bihar", lat:24.772949, lng:84.998228, availableSpots:14, occupiedSpots:11, totalSpots:25, pricePerHour:40, type:"covered", amenities:[], rating:4.0, state:"Bihar", district:"Gaya" },
  { _id:'67', name:"Muzaffarpur Metro Parking", address:"Muzaffarpur, Bihar", lat:26.131514, lng:85.380104, availableSpots:6, occupiedSpots:14, totalSpots:20, pricePerHour:50, type:"open", amenities:["24h"], rating:4.0, state:"Bihar", district:"Muzaffarpur" },
  { _id:'68', name:"Muzaffarpur Business District Parking", address:"Muzaffarpur, Bihar", lat:26.134274, lng:85.409676, availableSpots:11, occupiedSpots:19, totalSpots:30, pricePerHour:80, type:"basement", amenities:["ev", "24h"], rating:4.1, state:"Bihar", district:"Muzaffarpur" },
  { _id:'69', name:"Muzaffarpur Town Hall Parking", address:"Muzaffarpur, Bihar", lat:26.138946, lng:85.392449, availableSpots:3, occupiedSpots:17, totalSpots:20, pricePerHour:35, type:"covered", amenities:[], rating:3.8, state:"Bihar", district:"Muzaffarpur" },
  { _id:'70', name:"Bhagalpur Junction Parking", address:"Bhagalpur, Bihar", lat:25.261001, lng:86.974819, availableSpots:19, occupiedSpots:1, totalSpots:20, pricePerHour:50, type:"open", amenities:["ev", "24h"], rating:4.0, state:"Bihar", district:"Bhagalpur" },
  { _id:'71', name:"Bhagalpur Bus Stand Parking", address:"Bhagalpur, Bihar", lat:25.253957, lng:86.981656, availableSpots:7, occupiedSpots:43, totalSpots:50, pricePerHour:50, type:"basement", amenities:["ev"], rating:4.8, state:"Bihar", district:"Bhagalpur" },
  { _id:'72', name:"Bhagalpur Civic Center Parking", address:"Bhagalpur, Bihar", lat:25.230103, lng:86.965975, availableSpots:0, occupiedSpots:40, totalSpots:40, pricePerHour:80, type:"covered", amenities:["24h"], rating:4.9, state:"Bihar", district:"Bhagalpur" },
  { _id:'73', name:"Darbhanga Railway Station Parking", address:"Darbhanga, Bihar", lat:26.155738, lng:85.900577, availableSpots:11, occupiedSpots:14, totalSpots:25, pricePerHour:50, type:"open", amenities:[], rating:3.6, state:"Bihar", district:"Darbhanga" },
  { _id:'74', name:"Darbhanga Central Parking", address:"Darbhanga, Bihar", lat:26.16077, lng:85.885008, availableSpots:21, occupiedSpots:9, totalSpots:30, pricePerHour:20, type:"basement", amenities:["24h"], rating:4.6, state:"Bihar", district:"Darbhanga" },
  { _id:'75', name:"Darbhanga Smart Parking Hub", address:"Darbhanga, Bihar", lat:26.146213, lng:85.884171, availableSpots:20, occupiedSpots:20, totalSpots:40, pricePerHour:50, type:"covered", amenities:["ev", "24h"], rating:4.5, state:"Bihar", district:"Darbhanga" },
  { _id:'76', name:"Purnia City Parking", address:"Purnia, Bihar", lat:25.779276, lng:87.462974, availableSpots:11, occupiedSpots:29, totalSpots:40, pricePerHour:100, type:"open", amenities:[], rating:4.4, state:"Bihar", district:"Purnia" },
  { _id:'77', name:"Purnia Municipal Parking", address:"Purnia, Bihar", lat:25.773343, lng:87.488649, availableSpots:9, occupiedSpots:21, totalSpots:30, pricePerHour:30, type:"basement", amenities:["ev", "24h"], rating:4.1, state:"Bihar", district:"Purnia" },
  { _id:'78', name:"Purnia Station Parking", address:"Purnia, Bihar", lat:25.780299, lng:87.481488, availableSpots:28, occupiedSpots:12, totalSpots:40, pricePerHour:60, type:"covered", amenities:["ev"], rating:4.5, state:"Bihar", district:"Purnia" },
  { _id:'79', name:"Ara Commercial Parking", address:"Ara, Bihar", lat:25.556947, lng:84.675349, availableSpots:21, occupiedSpots:4, totalSpots:25, pricePerHour:20, type:"open", amenities:["24h"], rating:3.9, state:"Bihar", district:"Ara" },
  { _id:'80', name:"Ara Market Parking", address:"Ara, Bihar", lat:25.563054, lng:84.66837, availableSpots:7, occupiedSpots:13, totalSpots:20, pricePerHour:35, type:"basement", amenities:[], rating:3.8, state:"Bihar", district:"Ara" },
  { _id:'81', name:"Raipur Market Parking", address:"Raipur, Chhattisgarh", lat:21.239365, lng:81.610577, availableSpots:15, occupiedSpots:10, totalSpots:25, pricePerHour:100, type:"covered", amenities:["24h"], rating:4.8, state:"Chhattisgarh", district:"Raipur" },
  { _id:'82', name:"Raipur Mall Parking", address:"Raipur, Chhattisgarh", lat:21.234313, lng:81.626178, availableSpots:12, occupiedSpots:38, totalSpots:50, pricePerHour:50, type:"open", amenities:["ev", "24h"], rating:4.2, state:"Chhattisgarh", district:"Raipur" },
  { _id:'83', name:"Raipur Junction Parking", address:"Raipur, Chhattisgarh", lat:21.241159, lng:81.635842, availableSpots:3, occupiedSpots:17, totalSpots:20, pricePerHour:50, type:"basement", amenities:[], rating:3.8, state:"Chhattisgarh", district:"Raipur" },
  { _id:'84', name:"Bhilai Business District Parking", address:"Bhilai, Chhattisgarh", lat:21.205964, lng:81.358736, availableSpots:3, occupiedSpots:37, totalSpots:40, pricePerHour:80, type:"covered", amenities:["ev", "24h"], rating:3.9, state:"Chhattisgarh", district:"Bhilai" },
  { _id:'85', name:"Bhilai Town Hall Parking", address:"Bhilai, Chhattisgarh", lat:21.207733, lng:81.349158, availableSpots:33, occupiedSpots:7, totalSpots:40, pricePerHour:80, type:"open", amenities:["ev"], rating:4.4, state:"Chhattisgarh", district:"Bhilai" },
  { _id:'86', name:"Bhilai Railway Station Parking", address:"Bhilai, Chhattisgarh", lat:21.211802, lng:81.366557, availableSpots:46, occupiedSpots:4, totalSpots:50, pricePerHour:80, type:"basement", amenities:["24h"], rating:4.1, state:"Chhattisgarh", district:"Bhilai" },
  { _id:'87', name:"Bilaspur Bus Stand Parking", address:"Bilaspur, Chhattisgarh", lat:22.095974, lng:82.136937, availableSpots:23, occupiedSpots:2, totalSpots:25, pricePerHour:60, type:"covered", amenities:[], rating:4.2, state:"Chhattisgarh", district:"Bilaspur" },
  { _id:'88', name:"Bilaspur Civic Center Parking", address:"Bilaspur, Chhattisgarh", lat:22.089771, lng:82.152695, availableSpots:24, occupiedSpots:6, totalSpots:30, pricePerHour:80, type:"open", amenities:["24h"], rating:4.2, state:"Chhattisgarh", district:"Bilaspur" },
  { _id:'89', name:"Bilaspur City Parking", address:"Bilaspur, Chhattisgarh", lat:22.06927, lng:82.136695, availableSpots:7, occupiedSpots:23, totalSpots:30, pricePerHour:35, type:"basement", amenities:["ev", "24h"], rating:4.0, state:"Chhattisgarh", district:"Bilaspur" },
  { _id:'90', name:"Korba Central Parking", address:"Korba, Chhattisgarh", lat:22.375221, lng:82.733323, availableSpots:7, occupiedSpots:18, totalSpots:25, pricePerHour:50, type:"covered", amenities:[], rating:4.5, state:"Chhattisgarh", district:"Korba" },
  { _id:'91', name:"Korba Smart Parking Hub", address:"Korba, Chhattisgarh", lat:22.367757, lng:82.732669, availableSpots:21, occupiedSpots:19, totalSpots:40, pricePerHour:80, type:"open", amenities:["ev", "24h"], rating:4.2, state:"Chhattisgarh", district:"Korba" },
  { _id:'92', name:"Korba Commercial Parking", address:"Korba, Chhattisgarh", lat:22.341991, lng:82.763416, availableSpots:37, occupiedSpots:3, totalSpots:40, pricePerHour:15, type:"basement", amenities:["ev"], rating:4.8, state:"Chhattisgarh", district:"Korba" },
  { _id:'93', name:"Jagdalpur Municipal Parking", address:"Jagdalpur, Chhattisgarh", lat:19.085424, lng:82.009515, availableSpots:11, occupiedSpots:9, totalSpots:20, pricePerHour:35, type:"covered", amenities:["24h"], rating:4.6, state:"Chhattisgarh", district:"Jagdalpur" },
  { _id:'94', name:"Jagdalpur Station Parking", address:"Jagdalpur, Chhattisgarh", lat:19.088938, lng:82.032437, availableSpots:34, occupiedSpots:6, totalSpots:40, pricePerHour:80, type:"open", amenities:[], rating:4.7, state:"Chhattisgarh", district:"Jagdalpur" },
  { _id:'95', name:"Jagdalpur Metro Parking", address:"Jagdalpur, Chhattisgarh", lat:19.090712, lng:82.013829, availableSpots:13, occupiedSpots:17, totalSpots:30, pricePerHour:60, type:"basement", amenities:["24h"], rating:3.5, state:"Chhattisgarh", district:"Jagdalpur" },
  { _id:'96', name:"Rajnandgaon Market Parking", address:"Rajnandgaon, Chhattisgarh", lat:21.090645, lng:81.038566, availableSpots:10, occupiedSpots:30, totalSpots:40, pricePerHour:60, type:"covered", amenities:["ev", "24h"], rating:4.9, state:"Chhattisgarh", district:"Rajnandgaon" },
  { _id:'97', name:"Rajnandgaon Mall Parking", address:"Rajnandgaon, Chhattisgarh", lat:21.116429, lng:81.032765, availableSpots:37, occupiedSpots:3, totalSpots:40, pricePerHour:100, type:"open", amenities:[], rating:4.5, state:"Chhattisgarh", district:"Rajnandgaon" },
  { _id:'98', name:"Rajnandgaon Junction Parking", address:"Rajnandgaon, Chhattisgarh", lat:21.080558, lng:81.028545, availableSpots:11, occupiedSpots:29, totalSpots:40, pricePerHour:15, type:"basement", amenities:["ev", "24h"], rating:3.9, state:"Chhattisgarh", district:"Rajnandgaon" },
  { _id:'99', name:"Raipur Business District Parking", address:"Raipur, Chhattisgarh", lat:21.244494, lng:81.627788, availableSpots:24, occupiedSpots:6, totalSpots:30, pricePerHour:50, type:"covered", amenities:["ev"], rating:3.9, state:"Chhattisgarh", district:"Raipur" },
  { _id:'100', name:"Raipur Town Hall Parking", address:"Raipur, Chhattisgarh", lat:21.269448, lng:81.626463, availableSpots:15, occupiedSpots:5, totalSpots:20, pricePerHour:15, type:"open", amenities:["24h"], rating:4.6, state:"Chhattisgarh", district:"Raipur" },
  { _id:'101', name:"Panaji Town Hall Parking", address:"Panaji, Goa", lat:15.472983, lng:73.845877, availableSpots:20, occupiedSpots:5, totalSpots:25, pricePerHour:20, type:"basement", amenities:[], rating:4.7, state:"Goa", district:"Panaji" },
  { _id:'102', name:"Panaji Railway Station Parking", address:"Panaji, Goa", lat:15.49697, lng:73.837969, availableSpots:6, occupiedSpots:19, totalSpots:25, pricePerHour:15, type:"covered", amenities:["24h"], rating:4.4, state:"Goa", district:"Panaji" },
  { _id:'103', name:"Panaji Central Parking", address:"Panaji, Goa", lat:15.480442, lng:73.826742, availableSpots:18, occupiedSpots:2, totalSpots:20, pricePerHour:30, type:"open", amenities:["ev", "24h"], rating:4.2, state:"Goa", district:"Panaji" },
  { _id:'104', name:"Margao Civic Center Parking", address:"Margao, Goa", lat:15.27345, lng:73.980956, availableSpots:38, occupiedSpots:12, totalSpots:50, pricePerHour:20, type:"basement", amenities:[], rating:4.7, state:"Goa", district:"Margao" },
  { _id:'105', name:"Margao City Parking", address:"Margao, Goa", lat:15.269751, lng:73.978642, availableSpots:1, occupiedSpots:49, totalSpots:50, pricePerHour:35, type:"covered", amenities:["ev", "24h"], rating:4.4, state:"Goa", district:"Margao" },
  { _id:'106', name:"Margao Municipal Parking", address:"Margao, Goa", lat:15.299521, lng:73.981212, availableSpots:2, occupiedSpots:23, totalSpots:25, pricePerHour:100, type:"open", amenities:["ev"], rating:4.5, state:"Goa", district:"Margao" },
  { _id:'107', name:"Vasco da Gama Smart Parking Hub", address:"Vasco da Gama, Goa", lat:15.40309, lng:73.798676, availableSpots:27, occupiedSpots:3, totalSpots:30, pricePerHour:100, type:"basement", amenities:["24h"], rating:4.7, state:"Goa", district:"Vasco da Gama" },
  { _id:'108', name:"Vasco da Gama Commercial Parking", address:"Vasco da Gama, Goa", lat:15.409849, lng:73.817237, availableSpots:11, occupiedSpots:9, totalSpots:20, pricePerHour:80, type:"covered", amenities:[], rating:4.1, state:"Goa", district:"Vasco da Gama" },
  { _id:'109', name:"Vasco da Gama Market Parking", address:"Vasco da Gama, Goa", lat:15.392823, lng:73.814838, availableSpots:0, occupiedSpots:30, totalSpots:30, pricePerHour:50, type:"open", amenities:["24h"], rating:4.7, state:"Goa", district:"Vasco da Gama" },
  { _id:'110', name:"Mapusa Station Parking", address:"Mapusa, Goa", lat:15.576022, lng:73.828732, availableSpots:9, occupiedSpots:31, totalSpots:40, pricePerHour:50, type:"basement", amenities:["ev", "24h"], rating:3.8, state:"Goa", district:"Mapusa" },
  { _id:'111', name:"Mapusa Metro Parking", address:"Mapusa, Goa", lat:15.59267, lng:73.816318, availableSpots:34, occupiedSpots:16, totalSpots:50, pricePerHour:60, type:"covered", amenities:[], rating:4.2, state:"Goa", district:"Mapusa" },
  { _id:'112', name:"Mapusa Business District Parking", address:"Mapusa, Goa", lat:15.604829, lng:73.813999, availableSpots:27, occupiedSpots:3, totalSpots:30, pricePerHour:30, type:"open", amenities:["ev", "24h"], rating:4.7, state:"Goa", district:"Mapusa" },
  { _id:'113', name:"Panaji Mall Parking", address:"Panaji, Goa", lat:15.474367, lng:73.843065, availableSpots:24, occupiedSpots:1, totalSpots:25, pricePerHour:60, type:"basement", amenities:["ev"], rating:4.4, state:"Goa", district:"Panaji" },
  { _id:'114', name:"Panaji Junction Parking", address:"Panaji, Goa", lat:15.497628, lng:73.821256, availableSpots:20, occupiedSpots:20, totalSpots:40, pricePerHour:25, type:"covered", amenities:["24h"], rating:4.2, state:"Goa", district:"Panaji" },
  { _id:'115', name:"Panaji Bus Stand Parking", address:"Panaji, Goa", lat:15.485093, lng:73.818134, availableSpots:28, occupiedSpots:2, totalSpots:30, pricePerHour:100, type:"open", amenities:[], rating:4.6, state:"Goa", district:"Panaji" },
  { _id:'116', name:"Margao Town Hall Parking", address:"Margao, Goa", lat:15.274251, lng:73.966606, availableSpots:2, occupiedSpots:23, totalSpots:25, pricePerHour:30, type:"basement", amenities:["24h"], rating:4.6, state:"Goa", district:"Margao" },
  { _id:'117', name:"Margao Railway Station Parking", address:"Margao, Goa", lat:15.282743, lng:73.996527, availableSpots:31, occupiedSpots:9, totalSpots:40, pricePerHour:60, type:"covered", amenities:["ev", "24h"], rating:4.7, state:"Goa", district:"Margao" },
  { _id:'118', name:"Margao Central Parking", address:"Margao, Goa", lat:15.266922, lng:73.975064, availableSpots:9, occupiedSpots:16, totalSpots:25, pricePerHour:100, type:"open", amenities:[], rating:4.1, state:"Goa", district:"Margao" },
  { _id:'119', name:"Vasco da Gama Civic Center Parking", address:"Vasco da Gama, Goa", lat:15.400139, lng:73.80835, availableSpots:21, occupiedSpots:29, totalSpots:50, pricePerHour:40, type:"basement", amenities:["ev", "24h"], rating:4.6, state:"Goa", district:"Vasco da Gama" },
  { _id:'120', name:"Vasco da Gama City Parking", address:"Vasco da Gama, Goa", lat:15.388837, lng:73.804656, availableSpots:6, occupiedSpots:14, totalSpots:20, pricePerHour:40, type:"covered", amenities:["ev"], rating:3.7, state:"Goa", district:"Vasco da Gama" },
  { _id:'121', name:"Ahmedabad City Parking", address:"Ahmedabad, Gujarat", lat:23.023935, lng:72.581888, availableSpots:6, occupiedSpots:19, totalSpots:25, pricePerHour:30, type:"open", amenities:["24h"], rating:4.6, state:"Gujarat", district:"Ahmedabad" },
  { _id:'122', name:"Ahmedabad Municipal Parking", address:"Ahmedabad, Gujarat", lat:23.01356, lng:72.574983, availableSpots:38, occupiedSpots:12, totalSpots:50, pricePerHour:35, type:"basement", amenities:[], rating:5.0, state:"Gujarat", district:"Ahmedabad" },
  { _id:'123', name:"Ahmedabad Station Parking", address:"Ahmedabad, Gujarat", lat:23.035805, lng:72.56325, availableSpots:5, occupiedSpots:25, totalSpots:30, pricePerHour:35, type:"covered", amenities:["24h"], rating:3.5, state:"Gujarat", district:"Ahmedabad" },
  { _id:'124', name:"Surat Commercial Parking", address:"Surat, Gujarat", lat:21.171565, lng:72.822072, availableSpots:17, occupiedSpots:3, totalSpots:20, pricePerHour:35, type:"open", amenities:["ev", "24h"], rating:4.5, state:"Gujarat", district:"Surat" },
  { _id:'125', name:"Surat Market Parking", address:"Surat, Gujarat", lat:21.155251, lng:72.845838, availableSpots:6, occupiedSpots:34, totalSpots:40, pricePerHour:15, type:"basement", amenities:[], rating:4.4, state:"Gujarat", district:"Surat" },
  { _id:'126', name:"Surat Mall Parking", address:"Surat, Gujarat", lat:21.168976, lng:72.828719, availableSpots:1, occupiedSpots:24, totalSpots:25, pricePerHour:35, type:"covered", amenities:["ev", "24h"], rating:4.9, state:"Gujarat", district:"Surat" },
  { _id:'127', name:"Vadodara Metro Parking", address:"Vadodara, Gujarat", lat:22.306309, lng:73.194085, availableSpots:31, occupiedSpots:9, totalSpots:40, pricePerHour:20, type:"open", amenities:["ev"], rating:4.4, state:"Gujarat", district:"Vadodara" },
  { _id:'128', name:"Vadodara Business District Parking", address:"Vadodara, Gujarat", lat:22.314658, lng:73.167269, availableSpots:19, occupiedSpots:31, totalSpots:50, pricePerHour:20, type:"basement", amenities:["24h"], rating:5.0, state:"Gujarat", district:"Vadodara" },
  { _id:'129', name:"Vadodara Town Hall Parking", address:"Vadodara, Gujarat", lat:22.291938, lng:73.191778, availableSpots:38, occupiedSpots:12, totalSpots:50, pricePerHour:100, type:"covered", amenities:[], rating:3.8, state:"Gujarat", district:"Vadodara" },
  { _id:'130', name:"Rajkot Junction Parking", address:"Rajkot, Gujarat", lat:22.304803, lng:70.800221, availableSpots:19, occupiedSpots:21, totalSpots:40, pricePerHour:100, type:"open", amenities:["24h"], rating:5.0, state:"Gujarat", district:"Rajkot" },
  { _id:'131', name:"Rajkot Bus Stand Parking", address:"Rajkot, Gujarat", lat:22.296115, lng:70.807041, availableSpots:47, occupiedSpots:3, totalSpots:50, pricePerHour:20, type:"basement", amenities:["ev", "24h"], rating:4.9, state:"Gujarat", district:"Rajkot" },
  { _id:'132', name:"Rajkot Civic Center Parking", address:"Rajkot, Gujarat", lat:22.292212, lng:70.790641, availableSpots:5, occupiedSpots:15, totalSpots:20, pricePerHour:30, type:"covered", amenities:[], rating:3.8, state:"Gujarat", district:"Rajkot" },
  { _id:'133', name:"Gandhinagar Railway Station Parking", address:"Gandhinagar, Gujarat", lat:23.198603, lng:72.617007, availableSpots:38, occupiedSpots:2, totalSpots:40, pricePerHour:60, type:"open", amenities:["ev", "24h"], rating:3.9, state:"Gujarat", district:"Gandhinagar" },
  { _id:'134', name:"Gandhinagar Central Parking", address:"Gandhinagar, Gujarat", lat:23.204859, lng:72.645178, availableSpots:4, occupiedSpots:36, totalSpots:40, pricePerHour:30, type:"basement", amenities:["ev"], rating:4.9, state:"Gujarat", district:"Gandhinagar" },
  { _id:'135', name:"Gandhinagar Smart Parking Hub", address:"Gandhinagar, Gujarat", lat:23.227113, lng:72.641902, availableSpots:13, occupiedSpots:12, totalSpots:25, pricePerHour:20, type:"covered", amenities:["24h"], rating:4.3, state:"Gujarat", district:"Gandhinagar" },
  { _id:'136', name:"Bhavnagar City Parking", address:"Bhavnagar, Gujarat", lat:21.770405, lng:72.168236, availableSpots:2, occupiedSpots:23, totalSpots:25, pricePerHour:15, type:"open", amenities:[], rating:3.7, state:"Gujarat", district:"Bhavnagar" },
  { _id:'137', name:"Bhavnagar Municipal Parking", address:"Bhavnagar, Gujarat", lat:21.756804, lng:72.161858, availableSpots:18, occupiedSpots:32, totalSpots:50, pricePerHour:60, type:"basement", amenities:["24h"], rating:3.7, state:"Gujarat", district:"Bhavnagar" },
  { _id:'138', name:"Bhavnagar Station Parking", address:"Bhavnagar, Gujarat", lat:21.772047, lng:72.159889, availableSpots:16, occupiedSpots:14, totalSpots:30, pricePerHour:80, type:"covered", amenities:["ev", "24h"], rating:4.2, state:"Gujarat", district:"Bhavnagar" },
  { _id:'139', name:"Junagadh Commercial Parking", address:"Junagadh, Gujarat", lat:21.505418, lng:70.439494, availableSpots:20, occupiedSpots:20, totalSpots:40, pricePerHour:100, type:"open", amenities:[], rating:3.9, state:"Gujarat", district:"Junagadh" },
  { _id:'140', name:"Junagadh Market Parking", address:"Junagadh, Gujarat", lat:21.505853, lng:70.476376, availableSpots:37, occupiedSpots:13, totalSpots:50, pricePerHour:15, type:"basement", amenities:["ev", "24h"], rating:5.0, state:"Gujarat", district:"Junagadh" },
  { _id:'141', name:"Gurugram Market Parking", address:"Gurugram, Haryana", lat:28.466391, lng:77.01738, availableSpots:5, occupiedSpots:15, totalSpots:20, pricePerHour:60, type:"covered", amenities:["ev"], rating:4.3, state:"Haryana", district:"Gurugram" },
  { _id:'142', name:"Gurugram Mall Parking", address:"Gurugram, Haryana", lat:28.457189, lng:77.017726, availableSpots:27, occupiedSpots:23, totalSpots:50, pricePerHour:60, type:"open", amenities:["24h"], rating:5.0, state:"Haryana", district:"Gurugram" },
  { _id:'143', name:"Gurugram Junction Parking", address:"Gurugram, Haryana", lat:28.4583, lng:77.022934, availableSpots:21, occupiedSpots:9, totalSpots:30, pricePerHour:20, type:"basement", amenities:[], rating:4.8, state:"Haryana", district:"Gurugram" },
  { _id:'144', name:"Faridabad Business District Parking", address:"Faridabad, Haryana", lat:28.402092, lng:77.325547, availableSpots:21, occupiedSpots:9, totalSpots:30, pricePerHour:50, type:"covered", amenities:["24h"], rating:4.7, state:"Haryana", district:"Faridabad" },
  { _id:'145', name:"Faridabad Town Hall Parking", address:"Faridabad, Haryana", lat:28.410904, lng:77.315993, availableSpots:8, occupiedSpots:22, totalSpots:30, pricePerHour:40, type:"open", amenities:["ev", "24h"], rating:3.7, state:"Haryana", district:"Faridabad" },
  { _id:'146', name:"Faridabad Railway Station Parking", address:"Faridabad, Haryana", lat:28.419802, lng:77.332396, availableSpots:17, occupiedSpots:3, totalSpots:20, pricePerHour:60, type:"basement", amenities:[], rating:4.1, state:"Haryana", district:"Faridabad" },
  { _id:'147', name:"Panipat Bus Stand Parking", address:"Panipat, Haryana", lat:29.378403, lng:76.957971, availableSpots:40, occupiedSpots:0, totalSpots:40, pricePerHour:60, type:"covered", amenities:["ev", "24h"], rating:4.6, state:"Haryana", district:"Panipat" },
  { _id:'148', name:"Panipat Civic Center Parking", address:"Panipat, Haryana", lat:29.379042, lng:76.965469, availableSpots:14, occupiedSpots:16, totalSpots:30, pricePerHour:60, type:"open", amenities:["ev"], rating:3.7, state:"Haryana", district:"Panipat" },
  { _id:'149', name:"Panipat City Parking", address:"Panipat, Haryana", lat:29.409826, lng:76.967855, availableSpots:22, occupiedSpots:3, totalSpots:25, pricePerHour:25, type:"basement", amenities:["24h"], rating:4.0, state:"Haryana", district:"Panipat" },
  { _id:'150', name:"Ambala Central Parking", address:"Ambala, Haryana", lat:30.358747, lng:76.77302, availableSpots:3, occupiedSpots:22, totalSpots:25, pricePerHour:60, type:"covered", amenities:[], rating:4.9, state:"Haryana", district:"Ambala" },
  { _id:'151', name:"Ambala Smart Parking Hub", address:"Ambala, Haryana", lat:30.384108, lng:76.762859, availableSpots:16, occupiedSpots:14, totalSpots:30, pricePerHour:35, type:"open", amenities:["24h"], rating:4.1, state:"Haryana", district:"Ambala" },
  { _id:'152', name:"Ambala Commercial Parking", address:"Ambala, Haryana", lat:30.3775, lng:76.775589, availableSpots:35, occupiedSpots:5, totalSpots:40, pricePerHour:25, type:"basement", amenities:["ev", "24h"], rating:4.1, state:"Haryana", district:"Ambala" },
  { _id:'153', name:"Hisar Municipal Parking", address:"Hisar, Haryana", lat:29.166075, lng:75.72203, availableSpots:2, occupiedSpots:23, totalSpots:25, pricePerHour:35, type:"covered", amenities:[], rating:4.7, state:"Haryana", district:"Hisar" },
  { _id:'154', name:"Hisar Station Parking", address:"Hisar, Haryana", lat:29.163376, lng:75.715295, availableSpots:17, occupiedSpots:33, totalSpots:50, pricePerHour:15, type:"open", amenities:["ev", "24h"], rating:3.9, state:"Haryana", district:"Hisar" },
  { _id:'155', name:"Hisar Metro Parking", address:"Hisar, Haryana", lat:29.141142, lng:75.725178, availableSpots:9, occupiedSpots:31, totalSpots:40, pricePerHour:60, type:"basement", amenities:["ev"], rating:4.3, state:"Haryana", district:"Hisar" },
  { _id:'156', name:"Rohtak Market Parking", address:"Rohtak, Haryana", lat:28.889305, lng:76.608677, availableSpots:24, occupiedSpots:26, totalSpots:50, pricePerHour:60, type:"covered", amenities:["24h"], rating:4.9, state:"Haryana", district:"Rohtak" },
  { _id:'157', name:"Rohtak Mall Parking", address:"Rohtak, Haryana", lat:28.910284, lng:76.625831, availableSpots:18, occupiedSpots:7, totalSpots:25, pricePerHour:50, type:"open", amenities:[], rating:3.9, state:"Haryana", district:"Rohtak" },
  { _id:'158', name:"Rohtak Junction Parking", address:"Rohtak, Haryana", lat:28.906522, lng:76.588346, availableSpots:24, occupiedSpots:16, totalSpots:40, pricePerHour:50, type:"basement", amenities:["24h"], rating:5.0, state:"Haryana", district:"Rohtak" },
  { _id:'159', name:"Karnal Business District Parking", address:"Karnal, Haryana", lat:29.697396, lng:76.996581, availableSpots:15, occupiedSpots:10, totalSpots:25, pricePerHour:15, type:"covered", amenities:["ev", "24h"], rating:3.7, state:"Haryana", district:"Karnal" },
  { _id:'160', name:"Karnal Town Hall Parking", address:"Karnal, Haryana", lat:29.704314, lng:76.98378, availableSpots:14, occupiedSpots:6, totalSpots:20, pricePerHour:20, type:"open", amenities:[], rating:4.3, state:"Haryana", district:"Karnal" },
  { _id:'161', name:"Shimla Town Hall Parking", address:"Shimla, Himachal Pradesh", lat:31.103077, lng:77.182298, availableSpots:9, occupiedSpots:31, totalSpots:40, pricePerHour:20, type:"basement", amenities:["ev", "24h"], rating:4.2, state:"Himachal Pradesh", district:"Shimla" },
  { _id:'162', name:"Shimla Railway Station Parking", address:"Shimla, Himachal Pradesh", lat:31.123568, lng:77.166942, availableSpots:5, occupiedSpots:35, totalSpots:40, pricePerHour:40, type:"covered", amenities:["ev"], rating:4.8, state:"Himachal Pradesh", district:"Shimla" },
  { _id:'163', name:"Shimla Central Parking", address:"Shimla, Himachal Pradesh", lat:31.119174, lng:77.1686, availableSpots:20, occupiedSpots:10, totalSpots:30, pricePerHour:60, type:"open", amenities:["24h"], rating:4.8, state:"Himachal Pradesh", district:"Shimla" },
  { _id:'164', name:"Manali Civic Center Parking", address:"Manali, Himachal Pradesh", lat:32.221036, lng:77.171437, availableSpots:7, occupiedSpots:23, totalSpots:30, pricePerHour:20, type:"basement", amenities:[], rating:4.2, state:"Himachal Pradesh", district:"Manali" },
  { _id:'165', name:"Manali City Parking", address:"Manali, Himachal Pradesh", lat:32.223538, lng:77.19405, availableSpots:14, occupiedSpots:6, totalSpots:20, pricePerHour:25, type:"covered", amenities:["24h"], rating:4.5, state:"Himachal Pradesh", district:"Manali" },
  { _id:'166', name:"Manali Municipal Parking", address:"Manali, Himachal Pradesh", lat:32.255737, lng:77.17054, availableSpots:9, occupiedSpots:11, totalSpots:20, pricePerHour:40, type:"open", amenities:["ev", "24h"], rating:4.1, state:"Himachal Pradesh", district:"Manali" },
  { _id:'167', name:"Dharamshala Smart Parking Hub", address:"Dharamshala, Himachal Pradesh", lat:32.204823, lng:76.324647, availableSpots:43, occupiedSpots:7, totalSpots:50, pricePerHour:25, type:"basement", amenities:[], rating:3.8, state:"Himachal Pradesh", district:"Dharamshala" },
  { _id:'168', name:"Dharamshala Commercial Parking", address:"Dharamshala, Himachal Pradesh", lat:32.202159, lng:76.338234, availableSpots:43, occupiedSpots:7, totalSpots:50, pricePerHour:30, type:"covered", amenities:["ev", "24h"], rating:4.2, state:"Himachal Pradesh", district:"Dharamshala" },
  { _id:'169', name:"Dharamshala Market Parking", address:"Dharamshala, Himachal Pradesh", lat:32.222326, lng:76.312688, availableSpots:14, occupiedSpots:16, totalSpots:30, pricePerHour:35, type:"open", amenities:["ev"], rating:4.5, state:"Himachal Pradesh", district:"Dharamshala" },
  { _id:'170', name:"Mandi Station Parking", address:"Mandi, Himachal Pradesh", lat:31.724556, lng:76.93281, availableSpots:21, occupiedSpots:9, totalSpots:30, pricePerHour:80, type:"basement", amenities:["24h"], rating:3.7, state:"Himachal Pradesh", district:"Mandi" },
  { _id:'171', name:"Mandi Metro Parking", address:"Mandi, Himachal Pradesh", lat:31.706269, lng:76.928023, availableSpots:19, occupiedSpots:31, totalSpots:50, pricePerHour:50, type:"covered", amenities:[], rating:4.5, state:"Himachal Pradesh", district:"Mandi" },
  { _id:'172', name:"Mandi Business District Parking", address:"Mandi, Himachal Pradesh", lat:31.706873, lng:76.926285, availableSpots:30, occupiedSpots:10, totalSpots:40, pricePerHour:20, type:"open", amenities:["24h"], rating:3.9, state:"Himachal Pradesh", district:"Mandi" },
  { _id:'173', name:"Solan Mall Parking", address:"Solan, Himachal Pradesh", lat:30.907377, lng:77.099692, availableSpots:0, occupiedSpots:30, totalSpots:30, pricePerHour:50, type:"basement", amenities:["ev", "24h"], rating:3.9, state:"Himachal Pradesh", district:"Solan" },
  { _id:'174', name:"Solan Junction Parking", address:"Solan, Himachal Pradesh", lat:30.907137, lng:77.104132, availableSpots:19, occupiedSpots:1, totalSpots:20, pricePerHour:60, type:"covered", amenities:[], rating:4.7, state:"Himachal Pradesh", district:"Solan" },
  { _id:'175', name:"Solan Bus Stand Parking", address:"Solan, Himachal Pradesh", lat:30.920617, lng:77.10773, availableSpots:19, occupiedSpots:6, totalSpots:25, pricePerHour:40, type:"open", amenities:["ev", "24h"], rating:3.8, state:"Himachal Pradesh", district:"Solan" },
  { _id:'176', name:"Kullu Town Hall Parking", address:"Kullu, Himachal Pradesh", lat:31.946805, lng:77.098925, availableSpots:20, occupiedSpots:5, totalSpots:25, pricePerHour:20, type:"basement", amenities:["ev"], rating:4.9, state:"Himachal Pradesh", district:"Kullu" },
  { _id:'177', name:"Kullu Railway Station Parking", address:"Kullu, Himachal Pradesh", lat:31.965054, lng:77.101257, availableSpots:2, occupiedSpots:38, totalSpots:40, pricePerHour:100, type:"covered", amenities:["24h"], rating:4.0, state:"Himachal Pradesh", district:"Kullu" },
  { _id:'178', name:"Kullu Central Parking", address:"Kullu, Himachal Pradesh", lat:31.944456, lng:77.125285, availableSpots:23, occupiedSpots:7, totalSpots:30, pricePerHour:50, type:"open", amenities:[], rating:3.8, state:"Himachal Pradesh", district:"Kullu" },
  { _id:'179', name:"Shimla Civic Center Parking", address:"Shimla, Himachal Pradesh", lat:31.090086, lng:77.174976, availableSpots:16, occupiedSpots:14, totalSpots:30, pricePerHour:80, type:"basement", amenities:["24h"], rating:4.9, state:"Himachal Pradesh", district:"Shimla" },
  { _id:'180', name:"Shimla City Parking", address:"Shimla, Himachal Pradesh", lat:31.118019, lng:77.163679, availableSpots:18, occupiedSpots:22, totalSpots:40, pricePerHour:40, type:"covered", amenities:["ev", "24h"], rating:4.7, state:"Himachal Pradesh", district:"Shimla" },
  { _id:'181', name:"Ranchi City Parking", address:"Ranchi, Jharkhand", lat:23.342833, lng:85.292612, availableSpots:21, occupiedSpots:4, totalSpots:25, pricePerHour:50, type:"open", amenities:[], rating:5.0, state:"Jharkhand", district:"Ranchi" },
  { _id:'182', name:"Ranchi Municipal Parking", address:"Ranchi, Jharkhand", lat:23.356284, lng:85.304231, availableSpots:0, occupiedSpots:40, totalSpots:40, pricePerHour:35, type:"basement", amenities:["ev", "24h"], rating:4.3, state:"Jharkhand", district:"Ranchi" },
  { _id:'183', name:"Ranchi Station Parking", address:"Ranchi, Jharkhand", lat:23.342291, lng:85.316513, availableSpots:18, occupiedSpots:12, totalSpots:30, pricePerHour:50, type:"covered", amenities:["ev"], rating:4.7, state:"Jharkhand", district:"Ranchi" },
  { _id:'184', name:"Jamshedpur Commercial Parking", address:"Jamshedpur, Jharkhand", lat:22.822212, lng:86.187234, availableSpots:15, occupiedSpots:10, totalSpots:25, pricePerHour:15, type:"open", amenities:["24h"], rating:4.4, state:"Jharkhand", district:"Jamshedpur" },
  { _id:'185', name:"Jamshedpur Market Parking", address:"Jamshedpur, Jharkhand", lat:22.822327, lng:86.19602, availableSpots:14, occupiedSpots:36, totalSpots:50, pricePerHour:20, type:"basement", amenities:[], rating:4.5, state:"Jharkhand", district:"Jamshedpur" },
  { _id:'186', name:"Jamshedpur Mall Parking", address:"Jamshedpur, Jharkhand", lat:22.803171, lng:86.210943, availableSpots:7, occupiedSpots:33, totalSpots:40, pricePerHour:25, type:"covered", amenities:["24h"], rating:3.6, state:"Jharkhand", district:"Jamshedpur" },
  { _id:'187', name:"Dhanbad Metro Parking", address:"Dhanbad, Jharkhand", lat:23.777188, lng:86.450237, availableSpots:3, occupiedSpots:17, totalSpots:20, pricePerHour:30, type:"open", amenities:["ev", "24h"], rating:4.8, state:"Jharkhand", district:"Dhanbad" },
  { _id:'188', name:"Dhanbad Business District Parking", address:"Dhanbad, Jharkhand", lat:23.781127, lng:86.428546, availableSpots:26, occupiedSpots:24, totalSpots:50, pricePerHour:100, type:"basement", amenities:[], rating:4.6, state:"Jharkhand", district:"Dhanbad" },
  { _id:'189', name:"Dhanbad Town Hall Parking", address:"Dhanbad, Jharkhand", lat:23.781881, lng:86.426995, availableSpots:15, occupiedSpots:5, totalSpots:20, pricePerHour:100, type:"covered", amenities:["ev", "24h"], rating:4.1, state:"Jharkhand", district:"Dhanbad" },
  { _id:'190', name:"Bokaro Junction Parking", address:"Bokaro, Jharkhand", lat:23.687361, lng:85.972809, availableSpots:6, occupiedSpots:24, totalSpots:30, pricePerHour:60, type:"open", amenities:["ev"], rating:4.2, state:"Jharkhand", district:"Bokaro" },
  { _id:'191', name:"Bokaro Bus Stand Parking", address:"Bokaro, Jharkhand", lat:23.658745, lng:85.986007, availableSpots:17, occupiedSpots:13, totalSpots:30, pricePerHour:40, type:"basement", amenities:["24h"], rating:3.6, state:"Jharkhand", district:"Bokaro" },
  { _id:'192', name:"Bokaro Civic Center Parking", address:"Bokaro, Jharkhand", lat:23.660335, lng:86.010228, availableSpots:5, occupiedSpots:35, totalSpots:40, pricePerHour:30, type:"covered", amenities:[], rating:4.5, state:"Jharkhand", district:"Bokaro" },
  { _id:'193', name:"Hazaribagh Railway Station Parking", address:"Hazaribagh, Jharkhand", lat:23.996386, lng:85.344554, availableSpots:7, occupiedSpots:23, totalSpots:30, pricePerHour:25, type:"open", amenities:["24h"], rating:4.7, state:"Jharkhand", district:"Hazaribagh" },
  { _id:'194', name:"Hazaribagh Central Parking", address:"Hazaribagh, Jharkhand", lat:23.980708, lng:85.376893, availableSpots:13, occupiedSpots:37, totalSpots:50, pricePerHour:100, type:"basement", amenities:["ev", "24h"], rating:3.8, state:"Jharkhand", district:"Hazaribagh" },
  { _id:'195', name:"Hazaribagh Smart Parking Hub", address:"Hazaribagh, Jharkhand", lat:24.007288, lng:85.356842, availableSpots:25, occupiedSpots:0, totalSpots:25, pricePerHour:100, type:"covered", amenities:[], rating:3.5, state:"Jharkhand", district:"Hazaribagh" },
  { _id:'196', name:"Deoghar City Parking", address:"Deoghar, Jharkhand", lat:24.499436, lng:86.680988, availableSpots:17, occupiedSpots:8, totalSpots:25, pricePerHour:35, type:"open", amenities:["ev", "24h"], rating:4.7, state:"Jharkhand", district:"Deoghar" },
  { _id:'197', name:"Deoghar Municipal Parking", address:"Deoghar, Jharkhand", lat:24.469497, lng:86.709858, availableSpots:0, occupiedSpots:25, totalSpots:25, pricePerHour:40, type:"basement", amenities:["ev"], rating:4.7, state:"Jharkhand", district:"Deoghar" },
  { _id:'198', name:"Deoghar Station Parking", address:"Deoghar, Jharkhand", lat:24.474617, lng:86.688151, availableSpots:8, occupiedSpots:17, totalSpots:25, pricePerHour:15, type:"covered", amenities:["24h"], rating:3.7, state:"Jharkhand", district:"Deoghar" },
  { _id:'199', name:"Ranchi Commercial Parking", address:"Ranchi, Jharkhand", lat:23.340938, lng:85.294146, availableSpots:15, occupiedSpots:5, totalSpots:20, pricePerHour:60, type:"open", amenities:[], rating:4.7, state:"Jharkhand", district:"Ranchi" },
  { _id:'200', name:"Ranchi Market Parking", address:"Ranchi, Jharkhand", lat:23.34463, lng:85.293962, availableSpots:14, occupiedSpots:36, totalSpots:50, pricePerHour:100, type:"basement", amenities:["24h"], rating:3.6, state:"Jharkhand", district:"Ranchi" },
  { _id:'201', name:"Bengaluru Market Parking", address:"Bengaluru, Karnataka", lat:12.982929, lng:77.609279, availableSpots:19, occupiedSpots:31, totalSpots:50, pricePerHour:60, type:"covered", amenities:["ev", "24h"], rating:4.5, state:"Karnataka", district:"Bengaluru" },
  { _id:'202', name:"Bengaluru Mall Parking", address:"Bengaluru, Karnataka", lat:12.952846, lng:77.614543, availableSpots:27, occupiedSpots:13, totalSpots:40, pricePerHour:20, type:"open", amenities:[], rating:4.2, state:"Karnataka", district:"Bengaluru" },
  { _id:'203', name:"Bengaluru Junction Parking", address:"Bengaluru, Karnataka", lat:12.987988, lng:77.57754, availableSpots:10, occupiedSpots:10, totalSpots:20, pricePerHour:100, type:"basement", amenities:["ev", "24h"], rating:3.7, state:"Karnataka", district:"Bengaluru" },
  { _id:'204', name:"Mysuru Business District Parking", address:"Mysuru, Karnataka", lat:12.280848, lng:76.644373, availableSpots:35, occupiedSpots:15, totalSpots:50, pricePerHour:40, type:"covered", amenities:["ev"], rating:4.1, state:"Karnataka", district:"Mysuru" },
  { _id:'205', name:"Mysuru Town Hall Parking", address:"Mysuru, Karnataka", lat:12.299696, lng:76.631196, availableSpots:38, occupiedSpots:12, totalSpots:50, pricePerHour:50, type:"open", amenities:["24h"], rating:3.6, state:"Karnataka", district:"Mysuru" },
  { _id:'206', name:"Mysuru Railway Station Parking", address:"Mysuru, Karnataka", lat:12.303871, lng:76.653512, availableSpots:46, occupiedSpots:4, totalSpots:50, pricePerHour:30, type:"basement", amenities:[], rating:4.1, state:"Karnataka", district:"Mysuru" },
  { _id:'207', name:"Mangaluru Bus Stand Parking", address:"Mangaluru, Karnataka", lat:12.929624, lng:74.852553, availableSpots:25, occupiedSpots:15, totalSpots:40, pricePerHour:50, type:"covered", amenities:["24h"], rating:4.6, state:"Karnataka", district:"Mangaluru" },
  { _id:'208', name:"Mangaluru Civic Center Parking", address:"Mangaluru, Karnataka", lat:12.906602, lng:74.848501, availableSpots:11, occupiedSpots:19, totalSpots:30, pricePerHour:25, type:"open", amenities:["ev", "24h"], rating:4.5, state:"Karnataka", district:"Mangaluru" },
  { _id:'209', name:"Mangaluru City Parking", address:"Mangaluru, Karnataka", lat:12.913071, lng:74.839649, availableSpots:2, occupiedSpots:18, totalSpots:20, pricePerHour:50, type:"basement", amenities:[], rating:3.6, state:"Karnataka", district:"Mangaluru" },
  { _id:'210', name:"Hubballi Central Parking", address:"Hubballi, Karnataka", lat:15.374252, lng:75.136471, availableSpots:3, occupiedSpots:47, totalSpots:50, pricePerHour:100, type:"covered", amenities:["ev", "24h"], rating:4.9, state:"Karnataka", district:"Hubballi" },
  { _id:'211', name:"Hubballi Smart Parking Hub", address:"Hubballi, Karnataka", lat:15.367167, lng:75.130801, availableSpots:22, occupiedSpots:18, totalSpots:40, pricePerHour:50, type:"open", amenities:["ev"], rating:4.8, state:"Karnataka", district:"Hubballi" },
  { _id:'212', name:"Hubballi Commercial Parking", address:"Hubballi, Karnataka", lat:15.373542, lng:75.142736, availableSpots:19, occupiedSpots:31, totalSpots:50, pricePerHour:40, type:"basement", amenities:["24h"], rating:3.7, state:"Karnataka", district:"Hubballi" },
  { _id:'213', name:"Belagavi Municipal Parking", address:"Belagavi, Karnataka", lat:15.849997, lng:74.483889, availableSpots:14, occupiedSpots:26, totalSpots:40, pricePerHour:20, type:"covered", amenities:[], rating:4.0, state:"Karnataka", district:"Belagavi" },
  { _id:'214', name:"Belagavi Station Parking", address:"Belagavi, Karnataka", lat:15.851951, lng:74.482295, availableSpots:18, occupiedSpots:12, totalSpots:30, pricePerHour:30, type:"open", amenities:["24h"], rating:4.7, state:"Karnataka", district:"Belagavi" },
  { _id:'215', name:"Belagavi Metro Parking", address:"Belagavi, Karnataka", lat:15.863506, lng:74.516682, availableSpots:39, occupiedSpots:11, totalSpots:50, pricePerHour:80, type:"basement", amenities:["ev", "24h"], rating:3.5, state:"Karnataka", district:"Belagavi" },
  { _id:'216', name:"Davangere Market Parking", address:"Davangere, Karnataka", lat:14.481563, lng:75.934978, availableSpots:0, occupiedSpots:30, totalSpots:30, pricePerHour:25, type:"covered", amenities:[], rating:3.9, state:"Karnataka", district:"Davangere" },
  { _id:'217', name:"Davangere Mall Parking", address:"Davangere, Karnataka", lat:14.474896, lng:75.938662, availableSpots:0, occupiedSpots:30, totalSpots:30, pricePerHour:25, type:"open", amenities:["ev", "24h"], rating:4.8, state:"Karnataka", district:"Davangere" },
  { _id:'218', name:"Davangere Junction Parking", address:"Davangere, Karnataka", lat:14.467053, lng:75.917831, availableSpots:23, occupiedSpots:2, totalSpots:25, pricePerHour:15, type:"basement", amenities:["ev"], rating:3.6, state:"Karnataka", district:"Davangere" },
  { _id:'219', name:"Ballari Business District Parking", address:"Ballari, Karnataka", lat:15.140619, lng:76.916448, availableSpots:21, occupiedSpots:19, totalSpots:40, pricePerHour:25, type:"covered", amenities:["24h"], rating:4.1, state:"Karnataka", district:"Ballari" },
  { _id:'220', name:"Ballari Town Hall Parking", address:"Ballari, Karnataka", lat:15.148264, lng:76.932473, availableSpots:38, occupiedSpots:12, totalSpots:50, pricePerHour:20, type:"open", amenities:[], rating:4.8, state:"Karnataka", district:"Ballari" },
  { _id:'221', name:"Thiruvananthapuram Town Hall Parking", address:"Thiruvananthapuram, Kerala", lat:8.510323, lng:76.946777, availableSpots:2, occupiedSpots:18, totalSpots:20, pricePerHour:35, type:"basement", amenities:["24h"], rating:4.2, state:"Kerala", district:"Thiruvananthapuram" },
  { _id:'222', name:"Thiruvananthapuram Railway Station Parking", address:"Thiruvananthapuram, Kerala", lat:8.521061, lng:76.940883, availableSpots:17, occupiedSpots:23, totalSpots:40, pricePerHour:30, type:"covered", amenities:["ev", "24h"], rating:4.6, state:"Kerala", district:"Thiruvananthapuram" },
  { _id:'223', name:"Thiruvananthapuram Central Parking", address:"Thiruvananthapuram, Kerala", lat:8.508653, lng:76.933797, availableSpots:21, occupiedSpots:9, totalSpots:30, pricePerHour:100, type:"open", amenities:[], rating:4.2, state:"Kerala", district:"Thiruvananthapuram" },
  { _id:'224', name:"Kochi Civic Center Parking", address:"Kochi, Kerala", lat:9.937885, lng:76.249117, availableSpots:38, occupiedSpots:2, totalSpots:40, pricePerHour:15, type:"basement", amenities:["ev", "24h"], rating:3.5, state:"Kerala", district:"Kochi" },
  { _id:'225', name:"Kochi City Parking", address:"Kochi, Kerala", lat:9.923257, lng:76.255749, availableSpots:24, occupiedSpots:1, totalSpots:25, pricePerHour:35, type:"covered", amenities:["ev"], rating:3.9, state:"Kerala", district:"Kochi" },
  { _id:'226', name:"Kochi Municipal Parking", address:"Kochi, Kerala", lat:9.915999, lng:76.267195, availableSpots:11, occupiedSpots:29, totalSpots:40, pricePerHour:25, type:"open", amenities:["24h"], rating:4.1, state:"Kerala", district:"Kochi" },
  { _id:'227', name:"Kozhikode Smart Parking Hub", address:"Kozhikode, Kerala", lat:11.266947, lng:75.78041, availableSpots:2, occupiedSpots:28, totalSpots:30, pricePerHour:50, type:"basement", amenities:[], rating:4.8, state:"Kerala", district:"Kozhikode" },
  { _id:'228', name:"Kozhikode Commercial Parking", address:"Kozhikode, Kerala", lat:11.240492, lng:75.76115, availableSpots:10, occupiedSpots:10, totalSpots:20, pricePerHour:100, type:"covered", amenities:["24h"], rating:4.1, state:"Kerala", district:"Kozhikode" },
  { _id:'229', name:"Kozhikode Market Parking", address:"Kozhikode, Kerala", lat:11.254977, lng:75.786006, availableSpots:3, occupiedSpots:27, totalSpots:30, pricePerHour:50, type:"open", amenities:["ev", "24h"], rating:3.5, state:"Kerala", district:"Kozhikode" },
  { _id:'230', name:"Thrissur Station Parking", address:"Thrissur, Kerala", lat:10.520591, lng:76.226453, availableSpots:29, occupiedSpots:21, totalSpots:50, pricePerHour:40, type:"basement", amenities:[], rating:3.6, state:"Kerala", district:"Thrissur" },
  { _id:'231', name:"Thrissur Metro Parking", address:"Thrissur, Kerala", lat:10.541379, lng:76.204133, availableSpots:25, occupiedSpots:25, totalSpots:50, pricePerHour:80, type:"covered", amenities:["ev", "24h"], rating:3.6, state:"Kerala", district:"Thrissur" },
  { _id:'232', name:"Thrissur Business District Parking", address:"Thrissur, Kerala", lat:10.542421, lng:76.224232, availableSpots:10, occupiedSpots:15, totalSpots:25, pricePerHour:25, type:"open", amenities:["ev"], rating:3.6, state:"Kerala", district:"Thrissur" },
  { _id:'233', name:"Kollam Mall Parking", address:"Kollam, Kerala", lat:8.898529, lng:76.615324, availableSpots:24, occupiedSpots:1, totalSpots:25, pricePerHour:40, type:"basement", amenities:["24h"], rating:4.0, state:"Kerala", district:"Kollam" },
  { _id:'234', name:"Kollam Junction Parking", address:"Kollam, Kerala", lat:8.911529, lng:76.619918, availableSpots:7, occupiedSpots:18, totalSpots:25, pricePerHour:20, type:"covered", amenities:[], rating:3.7, state:"Kerala", district:"Kollam" },
  { _id:'235', name:"Kollam Bus Stand Parking", address:"Kollam, Kerala", lat:8.881091, lng:76.618196, availableSpots:5, occupiedSpots:15, totalSpots:20, pricePerHour:60, type:"open", amenities:["24h"], rating:4.2, state:"Kerala", district:"Kollam" },
  { _id:'236', name:"Kannur Town Hall Parking", address:"Kannur, Kerala", lat:11.877049, lng:75.373579, availableSpots:41, occupiedSpots:9, totalSpots:50, pricePerHour:100, type:"basement", amenities:["ev", "24h"], rating:4.0, state:"Kerala", district:"Kannur" },
  { _id:'237', name:"Kannur Railway Station Parking", address:"Kannur, Kerala", lat:11.893339, lng:75.363046, availableSpots:4, occupiedSpots:36, totalSpots:40, pricePerHour:60, type:"covered", amenities:[], rating:4.2, state:"Kerala", district:"Kannur" },
  { _id:'238', name:"Kannur Central Parking", address:"Kannur, Kerala", lat:11.866613, lng:75.361387, availableSpots:11, occupiedSpots:9, totalSpots:20, pricePerHour:80, type:"open", amenities:["ev", "24h"], rating:3.6, state:"Kerala", district:"Kannur" },
  { _id:'239', name:"Palakkad Civic Center Parking", address:"Palakkad, Kerala", lat:10.78517, lng:76.636304, availableSpots:26, occupiedSpots:4, totalSpots:30, pricePerHour:35, type:"basement", amenities:["ev"], rating:3.6, state:"Kerala", district:"Palakkad" },
  { _id:'240', name:"Palakkad City Parking", address:"Palakkad, Kerala", lat:10.80127, lng:76.669012, availableSpots:38, occupiedSpots:12, totalSpots:50, pricePerHour:80, type:"covered", amenities:["24h"], rating:4.1, state:"Kerala", district:"Palakkad" },
  { _id:'241', name:"Bhopal City Parking", address:"Bhopal, Madhya Pradesh", lat:23.263113, lng:77.430769, availableSpots:14, occupiedSpots:6, totalSpots:20, pricePerHour:100, type:"open", amenities:[], rating:4.5, state:"Madhya Pradesh", district:"Bhopal" },
  { _id:'242', name:"Bhopal Municipal Parking", address:"Bhopal, Madhya Pradesh", lat:23.252761, lng:77.411625, availableSpots:1, occupiedSpots:24, totalSpots:25, pricePerHour:60, type:"basement", amenities:["24h"], rating:3.7, state:"Madhya Pradesh", district:"Bhopal" },
  { _id:'243', name:"Bhopal Station Parking", address:"Bhopal, Madhya Pradesh", lat:23.275865, lng:77.406338, availableSpots:16, occupiedSpots:4, totalSpots:20, pricePerHour:25, type:"covered", amenities:["ev", "24h"], rating:3.6, state:"Madhya Pradesh", district:"Bhopal" },
  { _id:'244', name:"Indore Commercial Parking", address:"Indore, Madhya Pradesh", lat:22.727905, lng:75.877339, availableSpots:33, occupiedSpots:17, totalSpots:50, pricePerHour:100, type:"open", amenities:[], rating:3.7, state:"Madhya Pradesh", district:"Indore" },
  { _id:'245', name:"Indore Market Parking", address:"Indore, Madhya Pradesh", lat:22.714514, lng:75.849016, availableSpots:21, occupiedSpots:19, totalSpots:40, pricePerHour:100, type:"basement", amenities:["ev", "24h"], rating:3.6, state:"Madhya Pradesh", district:"Indore" },
  { _id:'246', name:"Indore Mall Parking", address:"Indore, Madhya Pradesh", lat:22.724835, lng:75.851086, availableSpots:3, occupiedSpots:27, totalSpots:30, pricePerHour:80, type:"covered", amenities:["ev"], rating:4.5, state:"Madhya Pradesh", district:"Indore" },
  { _id:'247', name:"Gwalior Metro Parking", address:"Gwalior, Madhya Pradesh", lat:26.209666, lng:78.191749, availableSpots:9, occupiedSpots:41, totalSpots:50, pricePerHour:40, type:"open", amenities:["24h"], rating:3.6, state:"Madhya Pradesh", district:"Gwalior" },
  { _id:'248', name:"Gwalior Business District Parking", address:"Gwalior, Madhya Pradesh", lat:26.224844, lng:78.19947, availableSpots:30, occupiedSpots:0, totalSpots:30, pricePerHour:50, type:"basement", amenities:[], rating:3.7, state:"Madhya Pradesh", district:"Gwalior" },
  { _id:'249', name:"Gwalior Town Hall Parking", address:"Gwalior, Madhya Pradesh", lat:26.226653, lng:78.166189, availableSpots:24, occupiedSpots:26, totalSpots:50, pricePerHour:40, type:"covered", amenities:["24h"], rating:4.7, state:"Madhya Pradesh", district:"Gwalior" },
  { _id:'250', name:"Jabalpur Junction Parking", address:"Jabalpur, Madhya Pradesh", lat:23.188305, lng:79.999558, availableSpots:5, occupiedSpots:45, totalSpots:50, pricePerHour:50, type:"open", amenities:["ev", "24h"], rating:4.3, state:"Madhya Pradesh", district:"Jabalpur" },
  { _id:'251', name:"Jabalpur Bus Stand Parking", address:"Jabalpur, Madhya Pradesh", lat:23.162229, lng:79.978755, availableSpots:10, occupiedSpots:15, totalSpots:25, pricePerHour:60, type:"basement", amenities:[], rating:3.8, state:"Madhya Pradesh", district:"Jabalpur" },
  { _id:'252', name:"Jabalpur Civic Center Parking", address:"Jabalpur, Madhya Pradesh", lat:23.201499, lng:79.972598, availableSpots:27, occupiedSpots:3, totalSpots:30, pricePerHour:20, type:"covered", amenities:["ev", "24h"], rating:4.3, state:"Madhya Pradesh", district:"Jabalpur" },
  { _id:'253', name:"Ujjain Railway Station Parking", address:"Ujjain, Madhya Pradesh", lat:23.178091, lng:75.798046, availableSpots:2, occupiedSpots:48, totalSpots:50, pricePerHour:40, type:"open", amenities:["ev"], rating:4.8, state:"Madhya Pradesh", district:"Ujjain" },
  { _id:'254', name:"Ujjain Central Parking", address:"Ujjain, Madhya Pradesh", lat:23.181221, lng:75.79239, availableSpots:5, occupiedSpots:20, totalSpots:25, pricePerHour:25, type:"basement", amenities:["24h"], rating:4.7, state:"Madhya Pradesh", district:"Ujjain" },
  { _id:'255', name:"Ujjain Smart Parking Hub", address:"Ujjain, Madhya Pradesh", lat:23.187344, lng:75.800862, availableSpots:23, occupiedSpots:2, totalSpots:25, pricePerHour:60, type:"covered", amenities:[], rating:3.6, state:"Madhya Pradesh", district:"Ujjain" },
  { _id:'256', name:"Sagar City Parking", address:"Sagar, Madhya Pradesh", lat:23.833372, lng:78.746583, availableSpots:39, occupiedSpots:1, totalSpots:40, pricePerHour:35, type:"open", amenities:["24h"], rating:4.6, state:"Madhya Pradesh", district:"Sagar" },
  { _id:'257', name:"Sagar Municipal Parking", address:"Sagar, Madhya Pradesh", lat:23.850152, lng:78.72716, availableSpots:9, occupiedSpots:16, totalSpots:25, pricePerHour:60, type:"basement", amenities:["ev", "24h"], rating:4.9, state:"Madhya Pradesh", district:"Sagar" },
  { _id:'258', name:"Sagar Station Parking", address:"Sagar, Madhya Pradesh", lat:23.826561, lng:78.744932, availableSpots:28, occupiedSpots:22, totalSpots:50, pricePerHour:60, type:"covered", amenities:[], rating:4.7, state:"Madhya Pradesh", district:"Sagar" },
  { _id:'259', name:"Rewa Commercial Parking", address:"Rewa, Madhya Pradesh", lat:24.547325, lng:81.299816, availableSpots:10, occupiedSpots:30, totalSpots:40, pricePerHour:30, type:"open", amenities:["ev", "24h"], rating:4.7, state:"Madhya Pradesh", district:"Rewa" },
  { _id:'260', name:"Rewa Market Parking", address:"Rewa, Madhya Pradesh", lat:24.521736, lng:81.2897, availableSpots:23, occupiedSpots:17, totalSpots:40, pricePerHour:80, type:"basement", amenities:["ev"], rating:4.9, state:"Madhya Pradesh", district:"Rewa" },
  { _id:'261', name:"Mumbai Market Parking", address:"Mumbai, Maharashtra", lat:19.084456, lng:72.878336, availableSpots:9, occupiedSpots:11, totalSpots:20, pricePerHour:20, type:"covered", amenities:["24h"], rating:4.6, state:"Maharashtra", district:"Mumbai" },
  { _id:'262', name:"Mumbai Mall Parking", address:"Mumbai, Maharashtra", lat:19.066912, lng:72.893912, availableSpots:13, occupiedSpots:12, totalSpots:25, pricePerHour:20, type:"open", amenities:[], rating:4.9, state:"Maharashtra", district:"Mumbai" },
  { _id:'263', name:"Mumbai Junction Parking", address:"Mumbai, Maharashtra", lat:19.064882, lng:72.875745, availableSpots:29, occupiedSpots:1, totalSpots:30, pricePerHour:15, type:"basement", amenities:["24h"], rating:4.1, state:"Maharashtra", district:"Mumbai" },
  { _id:'264', name:"Pune Business District Parking", address:"Pune, Maharashtra", lat:18.516258, lng:73.851658, availableSpots:5, occupiedSpots:35, totalSpots:40, pricePerHour:40, type:"covered", amenities:["ev", "24h"], rating:3.8, state:"Maharashtra", district:"Pune" },
  { _id:'265', name:"Pune Town Hall Parking", address:"Pune, Maharashtra", lat:18.513147, lng:73.840663, availableSpots:25, occupiedSpots:5, totalSpots:30, pricePerHour:25, type:"open", amenities:[], rating:3.7, state:"Maharashtra", district:"Pune" },
  { _id:'266', name:"Pune Railway Station Parking", address:"Pune, Maharashtra", lat:18.511875, lng:73.86989, availableSpots:24, occupiedSpots:1, totalSpots:25, pricePerHour:60, type:"basement", amenities:["ev", "24h"], rating:4.2, state:"Maharashtra", district:"Pune" },
  { _id:'267', name:"Nagpur Bus Stand Parking", address:"Nagpur, Maharashtra", lat:21.12601, lng:79.071369, availableSpots:6, occupiedSpots:24, totalSpots:30, pricePerHour:25, type:"covered", amenities:["ev"], rating:4.3, state:"Maharashtra", district:"Nagpur" },
  { _id:'268', name:"Nagpur Civic Center Parking", address:"Nagpur, Maharashtra", lat:21.154889, lng:79.089311, availableSpots:9, occupiedSpots:11, totalSpots:20, pricePerHour:30, type:"open", amenities:["24h"], rating:4.0, state:"Maharashtra", district:"Nagpur" },
  { _id:'269', name:"Nagpur City Parking", address:"Nagpur, Maharashtra", lat:21.12771, lng:79.084993, availableSpots:29, occupiedSpots:21, totalSpots:50, pricePerHour:20, type:"basement", amenities:[], rating:3.7, state:"Maharashtra", district:"Nagpur" },
  { _id:'270', name:"Nashik Central Parking", address:"Nashik, Maharashtra", lat:20.013706, lng:73.79367, availableSpots:20, occupiedSpots:0, totalSpots:20, pricePerHour:80, type:"covered", amenities:["24h"], rating:4.4, state:"Maharashtra", district:"Nashik" },
  { _id:'271', name:"Nashik Smart Parking Hub", address:"Nashik, Maharashtra", lat:20.006242, lng:73.781451, availableSpots:19, occupiedSpots:1, totalSpots:20, pricePerHour:40, type:"open", amenities:["ev", "24h"], rating:3.9, state:"Maharashtra", district:"Nashik" },
  { _id:'272', name:"Nashik Commercial Parking", address:"Nashik, Maharashtra", lat:19.994163, lng:73.796375, availableSpots:16, occupiedSpots:4, totalSpots:20, pricePerHour:40, type:"basement", amenities:[], rating:3.6, state:"Maharashtra", district:"Nashik" },
  { _id:'273', name:"Aurangabad Municipal Parking", address:"Aurangabad, Maharashtra", lat:19.877242, lng:75.343593, availableSpots:35, occupiedSpots:15, totalSpots:50, pricePerHour:15, type:"covered", amenities:["ev", "24h"], rating:4.1, state:"Maharashtra", district:"Aurangabad" },
  { _id:'274', name:"Aurangabad Station Parking", address:"Aurangabad, Maharashtra", lat:19.875005, lng:75.348727, availableSpots:8, occupiedSpots:22, totalSpots:30, pricePerHour:15, type:"open", amenities:["ev"], rating:4.0, state:"Maharashtra", district:"Aurangabad" },
  { _id:'275', name:"Aurangabad Metro Parking", address:"Aurangabad, Maharashtra", lat:19.858902, lng:75.332945, availableSpots:18, occupiedSpots:2, totalSpots:20, pricePerHour:40, type:"basement", amenities:["24h"], rating:3.7, state:"Maharashtra", district:"Aurangabad" },
  { _id:'276', name:"Solapur Market Parking", address:"Solapur, Maharashtra", lat:17.653992, lng:75.899942, availableSpots:24, occupiedSpots:1, totalSpots:25, pricePerHour:60, type:"covered", amenities:[], rating:5.0, state:"Maharashtra", district:"Solapur" },
  { _id:'277', name:"Solapur Mall Parking", address:"Solapur, Maharashtra", lat:17.659041, lng:75.893691, availableSpots:2, occupiedSpots:23, totalSpots:25, pricePerHour:60, type:"open", amenities:["24h"], rating:3.6, state:"Maharashtra", district:"Solapur" },
  { _id:'278', name:"Solapur Junction Parking", address:"Solapur, Maharashtra", lat:17.647964, lng:75.918044, availableSpots:10, occupiedSpots:10, totalSpots:20, pricePerHour:35, type:"basement", amenities:["ev", "24h"], rating:4.3, state:"Maharashtra", district:"Solapur" },
  { _id:'279', name:"Amravati Business District Parking", address:"Amravati, Maharashtra", lat:20.956965, lng:77.781321, availableSpots:1, occupiedSpots:29, totalSpots:30, pricePerHour:30, type:"covered", amenities:[], rating:3.9, state:"Maharashtra", district:"Amravati" },
  { _id:'280', name:"Amravati Town Hall Parking", address:"Amravati, Maharashtra", lat:20.951886, lng:77.761512, availableSpots:8, occupiedSpots:22, totalSpots:30, pricePerHour:20, type:"open", amenities:["ev", "24h"], rating:4.7, state:"Maharashtra", district:"Amravati" },
  { _id:'281', name:"Imphal Town Hall Parking", address:"Imphal, Manipur", lat:24.814478, lng:93.932801, availableSpots:24, occupiedSpots:16, totalSpots:40, pricePerHour:40, type:"basement", amenities:["ev"], rating:5.0, state:"Manipur", district:"Imphal" },
  { _id:'282', name:"Imphal Railway Station Parking", address:"Imphal, Manipur", lat:24.816848, lng:93.936701, availableSpots:17, occupiedSpots:33, totalSpots:50, pricePerHour:20, type:"covered", amenities:["24h"], rating:4.6, state:"Manipur", district:"Imphal" },
  { _id:'283', name:"Imphal Central Parking", address:"Imphal, Manipur", lat:24.800157, lng:93.940898, availableSpots:17, occupiedSpots:8, totalSpots:25, pricePerHour:35, type:"open", amenities:[], rating:4.0, state:"Manipur", district:"Imphal" },
  { _id:'284', name:"Thoubal Civic Center Parking", address:"Thoubal, Manipur", lat:24.620103, lng:94.003937, availableSpots:14, occupiedSpots:16, totalSpots:30, pricePerHour:100, type:"basement", amenities:["24h"], rating:4.6, state:"Manipur", district:"Thoubal" },
  { _id:'285', name:"Thoubal City Parking", address:"Thoubal, Manipur", lat:24.623566, lng:93.995256, availableSpots:2, occupiedSpots:38, totalSpots:40, pricePerHour:40, type:"covered", amenities:["ev", "24h"], rating:4.4, state:"Manipur", district:"Thoubal" },
  { _id:'286', name:"Thoubal Municipal Parking", address:"Thoubal, Manipur", lat:24.634298, lng:94.003079, availableSpots:2, occupiedSpots:18, totalSpots:20, pricePerHour:50, type:"open", amenities:[], rating:4.0, state:"Manipur", district:"Thoubal" },
  { _id:'287', name:"Bishnupur Smart Parking Hub", address:"Bishnupur, Manipur", lat:24.637344, lng:93.773276, availableSpots:4, occupiedSpots:16, totalSpots:20, pricePerHour:100, type:"basement", amenities:["ev", "24h"], rating:4.5, state:"Manipur", district:"Bishnupur" },
  { _id:'288', name:"Bishnupur Commercial Parking", address:"Bishnupur, Manipur", lat:24.622827, lng:93.751149, availableSpots:24, occupiedSpots:1, totalSpots:25, pricePerHour:40, type:"covered", amenities:["ev"], rating:4.0, state:"Manipur", district:"Bishnupur" },
  { _id:'289', name:"Bishnupur Market Parking", address:"Bishnupur, Manipur", lat:24.643279, lng:93.747395, availableSpots:21, occupiedSpots:4, totalSpots:25, pricePerHour:60, type:"open", amenities:["24h"], rating:4.9, state:"Manipur", district:"Bishnupur" },
  { _id:'290', name:"Churachandpur Station Parking", address:"Churachandpur, Manipur", lat:24.327881, lng:93.687523, availableSpots:8, occupiedSpots:42, totalSpots:50, pricePerHour:80, type:"basement", amenities:[], rating:4.1, state:"Manipur", district:"Churachandpur" },
  { _id:'291', name:"Churachandpur Metro Parking", address:"Churachandpur, Manipur", lat:24.325575, lng:93.668148, availableSpots:0, occupiedSpots:20, totalSpots:20, pricePerHour:25, type:"covered", amenities:["24h"], rating:4.2, state:"Manipur", district:"Churachandpur" },
  { _id:'292', name:"Churachandpur Business District Parking", address:"Churachandpur, Manipur", lat:24.328479, lng:93.679467, availableSpots:24, occupiedSpots:6, totalSpots:30, pricePerHour:35, type:"open", amenities:["ev", "24h"], rating:4.6, state:"Manipur", district:"Churachandpur" },
  { _id:'293', name:"Imphal Mall Parking", address:"Imphal, Manipur", lat:24.805583, lng:93.941275, availableSpots:12, occupiedSpots:28, totalSpots:40, pricePerHour:20, type:"basement", amenities:[], rating:3.7, state:"Manipur", district:"Imphal" },
  { _id:'294', name:"Imphal Junction Parking", address:"Imphal, Manipur", lat:24.799962, lng:93.923706, availableSpots:5, occupiedSpots:35, totalSpots:40, pricePerHour:40, type:"covered", amenities:["ev", "24h"], rating:4.5, state:"Manipur", district:"Imphal" },
  { _id:'295', name:"Imphal Bus Stand Parking", address:"Imphal, Manipur", lat:24.825382, lng:93.9388, availableSpots:28, occupiedSpots:2, totalSpots:30, pricePerHour:35, type:"open", amenities:["ev"], rating:4.8, state:"Manipur", district:"Imphal" },
  { _id:'296', name:"Thoubal Town Hall Parking", address:"Thoubal, Manipur", lat:24.645372, lng:94.014593, availableSpots:25, occupiedSpots:0, totalSpots:25, pricePerHour:40, type:"basement", amenities:["24h"], rating:4.3, state:"Manipur", district:"Thoubal" },
  { _id:'297', name:"Thoubal Railway Station Parking", address:"Thoubal, Manipur", lat:24.621754, lng:93.985539, availableSpots:7, occupiedSpots:18, totalSpots:25, pricePerHour:60, type:"covered", amenities:[], rating:3.5, state:"Manipur", district:"Thoubal" },
  { _id:'298', name:"Thoubal Central Parking", address:"Thoubal, Manipur", lat:24.639061, lng:93.992256, availableSpots:8, occupiedSpots:42, totalSpots:50, pricePerHour:100, type:"open", amenities:["24h"], rating:4.8, state:"Manipur", district:"Thoubal" },
  { _id:'299', name:"Bishnupur Civic Center Parking", address:"Bishnupur, Manipur", lat:24.60793, lng:93.762026, availableSpots:33, occupiedSpots:7, totalSpots:40, pricePerHour:50, type:"basement", amenities:["ev", "24h"], rating:4.7, state:"Manipur", district:"Bishnupur" },
  { _id:'300', name:"Bishnupur City Parking", address:"Bishnupur, Manipur", lat:24.638234, lng:93.74905, availableSpots:20, occupiedSpots:10, totalSpots:30, pricePerHour:20, type:"covered", amenities:[], rating:4.2, state:"Manipur", district:"Bishnupur" },
  { _id:'301', name:"Shillong City Parking", address:"Shillong, Meghalaya", lat:25.586004, lng:91.887081, availableSpots:40, occupiedSpots:10, totalSpots:50, pricePerHour:100, type:"open", amenities:["ev", "24h"], rating:3.8, state:"Meghalaya", district:"Shillong" },
  { _id:'302', name:"Shillong Municipal Parking", address:"Shillong, Meghalaya", lat:25.597451, lng:91.890605, availableSpots:3, occupiedSpots:17, totalSpots:20, pricePerHour:80, type:"basement", amenities:["ev"], rating:3.7, state:"Meghalaya", district:"Shillong" },
  { _id:'303', name:"Shillong Station Parking", address:"Shillong, Meghalaya", lat:25.565386, lng:91.886206, availableSpots:11, occupiedSpots:14, totalSpots:25, pricePerHour:80, type:"covered", amenities:["24h"], rating:4.8, state:"Meghalaya", district:"Shillong" },
  { _id:'304', name:"Tura Commercial Parking", address:"Tura, Meghalaya", lat:25.529137, lng:90.206624, availableSpots:17, occupiedSpots:33, totalSpots:50, pricePerHour:25, type:"open", amenities:[], rating:4.4, state:"Meghalaya", district:"Tura" },
  { _id:'305', name:"Tura Market Parking", address:"Tura, Meghalaya", lat:25.519877, lng:90.200337, availableSpots:18, occupiedSpots:7, totalSpots:25, pricePerHour:100, type:"basement", amenities:["24h"], rating:3.7, state:"Meghalaya", district:"Tura" },
  { _id:'306', name:"Tura Mall Parking", address:"Tura, Meghalaya", lat:25.521649, lng:90.225425, availableSpots:21, occupiedSpots:29, totalSpots:50, pricePerHour:100, type:"covered", amenities:["ev", "24h"], rating:3.6, state:"Meghalaya", district:"Tura" },
  { _id:'307', name:"Nongpoh Metro Parking", address:"Nongpoh, Meghalaya", lat:25.915551, lng:91.856349, availableSpots:16, occupiedSpots:34, totalSpots:50, pricePerHour:30, type:"open", amenities:[], rating:4.7, state:"Meghalaya", district:"Nongpoh" },
  { _id:'308', name:"Nongpoh Business District Parking", address:"Nongpoh, Meghalaya", lat:25.897663, lng:91.87866, availableSpots:40, occupiedSpots:0, totalSpots:40, pricePerHour:80, type:"basement", amenities:["ev", "24h"], rating:3.9, state:"Meghalaya", district:"Nongpoh" },
  { _id:'309', name:"Nongpoh Town Hall Parking", address:"Nongpoh, Meghalaya", lat:25.919266, lng:91.872418, availableSpots:19, occupiedSpots:21, totalSpots:40, pricePerHour:60, type:"covered", amenities:["ev"], rating:3.6, state:"Meghalaya", district:"Nongpoh" },
  { _id:'310', name:"Jowai Junction Parking", address:"Jowai, Meghalaya", lat:25.433197, lng:92.198184, availableSpots:29, occupiedSpots:11, totalSpots:40, pricePerHour:30, type:"open", amenities:["24h"], rating:4.0, state:"Meghalaya", district:"Jowai" },
  { _id:'311', name:"Jowai Bus Stand Parking", address:"Jowai, Meghalaya", lat:25.436547, lng:92.215059, availableSpots:23, occupiedSpots:7, totalSpots:30, pricePerHour:40, type:"basement", amenities:[], rating:5.0, state:"Meghalaya", district:"Jowai" },
  { _id:'312', name:"Jowai Civic Center Parking", address:"Jowai, Meghalaya", lat:25.436031, lng:92.195422, availableSpots:6, occupiedSpots:44, totalSpots:50, pricePerHour:40, type:"covered", amenities:["24h"], rating:3.9, state:"Meghalaya", district:"Jowai" },
  { _id:'313', name:"Shillong Railway Station Parking", address:"Shillong, Meghalaya", lat:25.563701, lng:91.891284, availableSpots:3, occupiedSpots:22, totalSpots:25, pricePerHour:15, type:"open", amenities:["ev", "24h"], rating:3.9, state:"Meghalaya", district:"Shillong" },
  { _id:'314', name:"Shillong Central Parking", address:"Shillong, Meghalaya", lat:25.574166, lng:91.897915, availableSpots:5, occupiedSpots:20, totalSpots:25, pricePerHour:40, type:"basement", amenities:[], rating:4.9, state:"Meghalaya", district:"Shillong" },
  { _id:'315', name:"Shillong Smart Parking Hub", address:"Shillong, Meghalaya", lat:25.587645, lng:91.880893, availableSpots:15, occupiedSpots:10, totalSpots:25, pricePerHour:80, type:"covered", amenities:["ev", "24h"], rating:4.2, state:"Meghalaya", district:"Shillong" },
  { _id:'316', name:"Tura City Parking", address:"Tura, Meghalaya", lat:25.530463, lng:90.216495, availableSpots:12, occupiedSpots:8, totalSpots:20, pricePerHour:80, type:"open", amenities:["ev"], rating:4.2, state:"Meghalaya", district:"Tura" },
  { _id:'317', name:"Tura Municipal Parking", address:"Tura, Meghalaya", lat:25.504929, lng:90.219934, availableSpots:1, occupiedSpots:19, totalSpots:20, pricePerHour:35, type:"basement", amenities:["24h"], rating:4.2, state:"Meghalaya", district:"Tura" },
  { _id:'318', name:"Tura Station Parking", address:"Tura, Meghalaya", lat:25.530594, lng:90.22277, availableSpots:18, occupiedSpots:22, totalSpots:40, pricePerHour:80, type:"covered", amenities:[], rating:3.5, state:"Meghalaya", district:"Tura" },
  { _id:'319', name:"Nongpoh Commercial Parking", address:"Nongpoh, Meghalaya", lat:25.8853, lng:91.858457, availableSpots:23, occupiedSpots:7, totalSpots:30, pricePerHour:40, type:"open", amenities:["24h"], rating:4.6, state:"Meghalaya", district:"Nongpoh" },
  { _id:'320', name:"Nongpoh Market Parking", address:"Nongpoh, Meghalaya", lat:25.895637, lng:91.869123, availableSpots:35, occupiedSpots:15, totalSpots:50, pricePerHour:30, type:"basement", amenities:["ev", "24h"], rating:4.0, state:"Meghalaya", district:"Nongpoh" },
  { _id:'321', name:"Aizawl Market Parking", address:"Aizawl, Mizoram", lat:23.718644, lng:92.713054, availableSpots:35, occupiedSpots:5, totalSpots:40, pricePerHour:35, type:"covered", amenities:[], rating:4.7, state:"Mizoram", district:"Aizawl" },
  { _id:'322', name:"Aizawl Mall Parking", address:"Aizawl, Mizoram", lat:23.73203, lng:92.722042, availableSpots:3, occupiedSpots:22, totalSpots:25, pricePerHour:50, type:"open", amenities:["ev", "24h"], rating:4.1, state:"Mizoram", district:"Aizawl" },
  { _id:'323', name:"Aizawl Junction Parking", address:"Aizawl, Mizoram", lat:23.746572, lng:92.719913, availableSpots:24, occupiedSpots:6, totalSpots:30, pricePerHour:25, type:"basement", amenities:["ev"], rating:3.8, state:"Mizoram", district:"Aizawl" },
  { _id:'324', name:"Lunglei Business District Parking", address:"Lunglei, Mizoram", lat:22.883665, lng:92.733303, availableSpots:1, occupiedSpots:19, totalSpots:20, pricePerHour:25, type:"covered", amenities:["24h"], rating:4.6, state:"Mizoram", district:"Lunglei" },
  { _id:'325', name:"Lunglei Town Hall Parking", address:"Lunglei, Mizoram", lat:22.895459, lng:92.734073, availableSpots:19, occupiedSpots:6, totalSpots:25, pricePerHour:80, type:"open", amenities:[], rating:3.7, state:"Mizoram", district:"Lunglei" },
  { _id:'326', name:"Lunglei Railway Station Parking", address:"Lunglei, Mizoram", lat:22.900555, lng:92.726041, availableSpots:39, occupiedSpots:1, totalSpots:40, pricePerHour:35, type:"basement", amenities:["24h"], rating:4.4, state:"Mizoram", district:"Lunglei" },
  { _id:'327', name:"Champhai Bus Stand Parking", address:"Champhai, Mizoram", lat:23.462293, lng:93.328389, availableSpots:36, occupiedSpots:4, totalSpots:40, pricePerHour:35, type:"covered", amenities:["ev", "24h"], rating:4.2, state:"Mizoram", district:"Champhai" },
  { _id:'328', name:"Champhai Civic Center Parking", address:"Champhai, Mizoram", lat:23.442665, lng:93.32125, availableSpots:13, occupiedSpots:7, totalSpots:20, pricePerHour:100, type:"open", amenities:[], rating:4.0, state:"Mizoram", district:"Champhai" },
  { _id:'329', name:"Champhai City Parking", address:"Champhai, Mizoram", lat:23.477951, lng:93.342884, availableSpots:19, occupiedSpots:1, totalSpots:20, pricePerHour:60, type:"basement", amenities:["ev", "24h"], rating:3.9, state:"Mizoram", district:"Champhai" },
  { _id:'330', name:"Serchhip Central Parking", address:"Serchhip, Mizoram", lat:23.315324, lng:92.862782, availableSpots:36, occupiedSpots:14, totalSpots:50, pricePerHour:30, type:"covered", amenities:["ev"], rating:4.6, state:"Mizoram", district:"Serchhip" },
  { _id:'331', name:"Serchhip Smart Parking Hub", address:"Serchhip, Mizoram", lat:23.312441, lng:92.83072, availableSpots:49, occupiedSpots:1, totalSpots:50, pricePerHour:50, type:"open", amenities:["24h"], rating:3.7, state:"Mizoram", district:"Serchhip" },
  { _id:'332', name:"Serchhip Commercial Parking", address:"Serchhip, Mizoram", lat:23.316329, lng:92.825163, availableSpots:6, occupiedSpots:14, totalSpots:20, pricePerHour:15, type:"basement", amenities:[], rating:4.2, state:"Mizoram", district:"Serchhip" },
  { _id:'333', name:"Aizawl Municipal Parking", address:"Aizawl, Mizoram", lat:23.723851, lng:92.714118, availableSpots:13, occupiedSpots:12, totalSpots:25, pricePerHour:80, type:"covered", amenities:["24h"], rating:4.7, state:"Mizoram", district:"Aizawl" },
  { _id:'334', name:"Aizawl Station Parking", address:"Aizawl, Mizoram", lat:23.743921, lng:92.732513, availableSpots:4, occupiedSpots:16, totalSpots:20, pricePerHour:80, type:"open", amenities:["ev", "24h"], rating:3.8, state:"Mizoram", district:"Aizawl" },
  { _id:'335', name:"Aizawl Metro Parking", address:"Aizawl, Mizoram", lat:23.720102, lng:92.724089, availableSpots:24, occupiedSpots:26, totalSpots:50, pricePerHour:40, type:"basement", amenities:[], rating:4.9, state:"Mizoram", district:"Aizawl" },
  { _id:'336', name:"Lunglei Market Parking", address:"Lunglei, Mizoram", lat:22.881687, lng:92.734625, availableSpots:22, occupiedSpots:28, totalSpots:50, pricePerHour:35, type:"covered", amenities:["ev", "24h"], rating:4.4, state:"Mizoram", district:"Lunglei" },
  { _id:'337', name:"Lunglei Mall Parking", address:"Lunglei, Mizoram", lat:22.870991, lng:92.723161, availableSpots:19, occupiedSpots:31, totalSpots:50, pricePerHour:30, type:"open", amenities:["ev"], rating:4.9, state:"Mizoram", district:"Lunglei" },
  { _id:'338', name:"Lunglei Junction Parking", address:"Lunglei, Mizoram", lat:22.90259, lng:92.744147, availableSpots:22, occupiedSpots:3, totalSpots:25, pricePerHour:60, type:"basement", amenities:["24h"], rating:4.0, state:"Mizoram", district:"Lunglei" },
  { _id:'339', name:"Champhai Business District Parking", address:"Champhai, Mizoram", lat:23.455952, lng:93.345348, availableSpots:9, occupiedSpots:21, totalSpots:30, pricePerHour:20, type:"covered", amenities:[], rating:4.4, state:"Mizoram", district:"Champhai" },
  { _id:'340', name:"Champhai Town Hall Parking", address:"Champhai, Mizoram", lat:23.463728, lng:93.34383, availableSpots:22, occupiedSpots:18, totalSpots:40, pricePerHour:25, type:"open", amenities:["24h"], rating:3.9, state:"Mizoram", district:"Champhai" },
  { _id:'341', name:"Kohima Town Hall Parking", address:"Kohima, Nagaland", lat:25.661605, lng:94.116266, availableSpots:29, occupiedSpots:1, totalSpots:30, pricePerHour:60, type:"basement", amenities:["ev", "24h"], rating:4.5, state:"Nagaland", district:"Kohima" },
  { _id:'342', name:"Kohima Railway Station Parking", address:"Kohima, Nagaland", lat:25.679994, lng:94.096259, availableSpots:17, occupiedSpots:33, totalSpots:50, pricePerHour:80, type:"covered", amenities:[], rating:4.5, state:"Nagaland", district:"Kohima" },
  { _id:'343', name:"Kohima Central Parking", address:"Kohima, Nagaland", lat:25.655591, lng:94.112327, availableSpots:15, occupiedSpots:35, totalSpots:50, pricePerHour:30, type:"open", amenities:["ev", "24h"], rating:3.6, state:"Nagaland", district:"Kohima" },
  { _id:'344', name:"Dimapur Civic Center Parking", address:"Dimapur, Nagaland", lat:25.920907, lng:93.715527, availableSpots:1, occupiedSpots:24, totalSpots:25, pricePerHour:20, type:"basement", amenities:["ev"], rating:4.1, state:"Nagaland", district:"Dimapur" },
  { _id:'345', name:"Dimapur City Parking", address:"Dimapur, Nagaland", lat:25.913394, lng:93.710522, availableSpots:0, occupiedSpots:25, totalSpots:25, pricePerHour:80, type:"covered", amenities:["24h"], rating:5.0, state:"Nagaland", district:"Dimapur" },
  { _id:'346', name:"Dimapur Municipal Parking", address:"Dimapur, Nagaland", lat:25.891018, lng:93.732616, availableSpots:30, occupiedSpots:10, totalSpots:40, pricePerHour:30, type:"open", amenities:[], rating:4.6, state:"Nagaland", district:"Dimapur" },
  { _id:'347', name:"Mokokchung Smart Parking Hub", address:"Mokokchung, Nagaland", lat:26.31749, lng:94.504517, availableSpots:2, occupiedSpots:18, totalSpots:20, pricePerHour:100, type:"basement", amenities:["24h"], rating:3.8, state:"Nagaland", district:"Mokokchung" },
  { _id:'348', name:"Mokokchung Commercial Parking", address:"Mokokchung, Nagaland", lat:26.335547, lng:94.527113, availableSpots:5, occupiedSpots:15, totalSpots:20, pricePerHour:50, type:"covered", amenities:["ev", "24h"], rating:4.8, state:"Nagaland", district:"Mokokchung" },
  { _id:'349', name:"Mokokchung Market Parking", address:"Mokokchung, Nagaland", lat:26.313032, lng:94.529885, availableSpots:31, occupiedSpots:9, totalSpots:40, pricePerHour:25, type:"open", amenities:[], rating:4.9, state:"Nagaland", district:"Mokokchung" },
  { _id:'350', name:"Tuensang Station Parking", address:"Tuensang, Nagaland", lat:26.286485, lng:94.839042, availableSpots:0, occupiedSpots:20, totalSpots:20, pricePerHour:35, type:"basement", amenities:["ev", "24h"], rating:4.4, state:"Nagaland", district:"Tuensang" },
  { _id:'351', name:"Tuensang Metro Parking", address:"Tuensang, Nagaland", lat:26.252292, lng:94.84132, availableSpots:14, occupiedSpots:16, totalSpots:30, pricePerHour:80, type:"covered", amenities:["ev"], rating:4.3, state:"Nagaland", district:"Tuensang" },
  { _id:'352', name:"Tuensang Business District Parking", address:"Tuensang, Nagaland", lat:26.28357, lng:94.807368, availableSpots:29, occupiedSpots:21, totalSpots:50, pricePerHour:35, type:"open", amenities:["24h"], rating:3.8, state:"Nagaland", district:"Tuensang" },
  { _id:'353', name:"Kohima Mall Parking", address:"Kohima, Nagaland", lat:25.654606, lng:94.0942, availableSpots:16, occupiedSpots:24, totalSpots:40, pricePerHour:25, type:"basement", amenities:[], rating:3.5, state:"Nagaland", district:"Kohima" },
  { _id:'354', name:"Kohima Junction Parking", address:"Kohima, Nagaland", lat:25.663584, lng:94.099501, availableSpots:5, occupiedSpots:20, totalSpots:25, pricePerHour:100, type:"covered", amenities:["24h"], rating:4.8, state:"Nagaland", district:"Kohima" },
  { _id:'355', name:"Kohima Bus Stand Parking", address:"Kohima, Nagaland", lat:25.685982, lng:94.12078, availableSpots:20, occupiedSpots:30, totalSpots:50, pricePerHour:20, type:"open", amenities:["ev", "24h"], rating:4.1, state:"Nagaland", district:"Kohima" },
  { _id:'356', name:"Dimapur Town Hall Parking", address:"Dimapur, Nagaland", lat:25.888515, lng:93.745767, availableSpots:20, occupiedSpots:20, totalSpots:40, pricePerHour:30, type:"basement", amenities:[], rating:3.5, state:"Nagaland", district:"Dimapur" },
  { _id:'357', name:"Dimapur Railway Station Parking", address:"Dimapur, Nagaland", lat:25.900043, lng:93.724369, availableSpots:30, occupiedSpots:0, totalSpots:30, pricePerHour:40, type:"covered", amenities:["ev", "24h"], rating:4.0, state:"Nagaland", district:"Dimapur" },
  { _id:'358', name:"Dimapur Central Parking", address:"Dimapur, Nagaland", lat:25.913615, lng:93.706957, availableSpots:22, occupiedSpots:8, totalSpots:30, pricePerHour:30, type:"open", amenities:["ev"], rating:3.6, state:"Nagaland", district:"Dimapur" },
  { _id:'359', name:"Mokokchung Civic Center Parking", address:"Mokokchung, Nagaland", lat:26.310729, lng:94.505372, availableSpots:32, occupiedSpots:8, totalSpots:40, pricePerHour:35, type:"basement", amenities:["24h"], rating:4.5, state:"Nagaland", district:"Mokokchung" },
  { _id:'360', name:"Mokokchung City Parking", address:"Mokokchung, Nagaland", lat:26.331548, lng:94.530725, availableSpots:19, occupiedSpots:11, totalSpots:30, pricePerHour:30, type:"covered", amenities:[], rating:3.8, state:"Nagaland", district:"Mokokchung" },
  { _id:'361', name:"Bhubaneswar City Parking", address:"Bhubaneswar, Odisha", lat:20.281443, lng:85.810627, availableSpots:23, occupiedSpots:27, totalSpots:50, pricePerHour:50, type:"open", amenities:["24h"], rating:4.6, state:"Odisha", district:"Bhubaneswar" },
  { _id:'362', name:"Bhubaneswar Municipal Parking", address:"Bhubaneswar, Odisha", lat:20.312612, lng:85.834794, availableSpots:24, occupiedSpots:1, totalSpots:25, pricePerHour:30, type:"basement", amenities:["ev", "24h"], rating:4.5, state:"Odisha", district:"Bhubaneswar" },
  { _id:'363', name:"Bhubaneswar Station Parking", address:"Bhubaneswar, Odisha", lat:20.299933, lng:85.835995, availableSpots:28, occupiedSpots:22, totalSpots:50, pricePerHour:80, type:"covered", amenities:[], rating:4.6, state:"Odisha", district:"Bhubaneswar" },
  { _id:'364', name:"Cuttack Commercial Parking", address:"Cuttack, Odisha", lat:20.445624, lng:85.885367, availableSpots:17, occupiedSpots:3, totalSpots:20, pricePerHour:80, type:"open", amenities:["ev", "24h"], rating:3.8, state:"Odisha", district:"Cuttack" },
  { _id:'365', name:"Cuttack Market Parking", address:"Cuttack, Odisha", lat:20.463966, lng:85.869381, availableSpots:28, occupiedSpots:22, totalSpots:50, pricePerHour:20, type:"basement", amenities:["ev"], rating:4.5, state:"Odisha", district:"Cuttack" },
  { _id:'366', name:"Cuttack Mall Parking", address:"Cuttack, Odisha", lat:20.471177, lng:85.882353, availableSpots:28, occupiedSpots:22, totalSpots:50, pricePerHour:15, type:"covered", amenities:["24h"], rating:4.2, state:"Odisha", district:"Cuttack" },
  { _id:'367', name:"Rourkela Metro Parking", address:"Rourkela, Odisha", lat:22.26093, lng:84.851872, availableSpots:17, occupiedSpots:3, totalSpots:20, pricePerHour:60, type:"open", amenities:[], rating:4.5, state:"Odisha", district:"Rourkela" },
  { _id:'368', name:"Rourkela Business District Parking", address:"Rourkela, Odisha", lat:22.252727, lng:84.834471, availableSpots:26, occupiedSpots:4, totalSpots:30, pricePerHour:15, type:"basement", amenities:["24h"], rating:4.6, state:"Odisha", district:"Rourkela" },
  { _id:'369', name:"Rourkela Town Hall Parking", address:"Rourkela, Odisha", lat:22.263532, lng:84.835412, availableSpots:22, occupiedSpots:8, totalSpots:30, pricePerHour:20, type:"covered", amenities:["ev", "24h"], rating:4.3, state:"Odisha", district:"Rourkela" },
  { _id:'370', name:"Berhampur Junction Parking", address:"Berhampur, Odisha", lat:19.29741, lng:84.809869, availableSpots:2, occupiedSpots:38, totalSpots:40, pricePerHour:35, type:"open", amenities:[], rating:4.1, state:"Odisha", district:"Berhampur" },
  { _id:'371', name:"Berhampur Bus Stand Parking", address:"Berhampur, Odisha", lat:19.325759, lng:84.804733, availableSpots:23, occupiedSpots:17, totalSpots:40, pricePerHour:50, type:"basement", amenities:["ev", "24h"], rating:4.2, state:"Odisha", district:"Berhampur" },
  { _id:'372', name:"Berhampur Civic Center Parking", address:"Berhampur, Odisha", lat:19.331685, lng:84.7892, availableSpots:17, occupiedSpots:3, totalSpots:20, pricePerHour:25, type:"covered", amenities:["ev"], rating:4.5, state:"Odisha", district:"Berhampur" },
  { _id:'373', name:"Sambalpur Railway Station Parking", address:"Sambalpur, Odisha", lat:21.460811, lng:83.962739, availableSpots:25, occupiedSpots:25, totalSpots:50, pricePerHour:80, type:"open", amenities:["24h"], rating:3.7, state:"Odisha", district:"Sambalpur" },
  { _id:'374', name:"Sambalpur Central Parking", address:"Sambalpur, Odisha", lat:21.486049, lng:83.988993, availableSpots:9, occupiedSpots:11, totalSpots:20, pricePerHour:60, type:"basement", amenities:[], rating:4.5, state:"Odisha", district:"Sambalpur" },
  { _id:'375', name:"Sambalpur Smart Parking Hub", address:"Sambalpur, Odisha", lat:21.468678, lng:83.976877, availableSpots:7, occupiedSpots:18, totalSpots:25, pricePerHour:60, type:"covered", amenities:["24h"], rating:4.0, state:"Odisha", district:"Sambalpur" },
  { _id:'376', name:"Puri City Parking", address:"Puri, Odisha", lat:19.804526, lng:85.848696, availableSpots:1, occupiedSpots:19, totalSpots:20, pricePerHour:50, type:"open", amenities:["ev", "24h"], rating:4.4, state:"Odisha", district:"Puri" },
  { _id:'377', name:"Puri Municipal Parking", address:"Puri, Odisha", lat:19.83095, lng:85.846762, availableSpots:6, occupiedSpots:19, totalSpots:25, pricePerHour:20, type:"basement", amenities:[], rating:3.7, state:"Odisha", district:"Puri" },
  { _id:'378', name:"Puri Station Parking", address:"Puri, Odisha", lat:19.794843, lng:85.835111, availableSpots:7, occupiedSpots:13, totalSpots:20, pricePerHour:15, type:"covered", amenities:["ev", "24h"], rating:4.1, state:"Odisha", district:"Puri" },
  { _id:'379', name:"Balasore Commercial Parking", address:"Balasore, Odisha", lat:21.482774, lng:86.924091, availableSpots:4, occupiedSpots:16, totalSpots:20, pricePerHour:80, type:"open", amenities:["ev"], rating:5.0, state:"Odisha", district:"Balasore" },
  { _id:'380', name:"Balasore Market Parking", address:"Balasore, Odisha", lat:21.482766, lng:86.952056, availableSpots:20, occupiedSpots:30, totalSpots:50, pricePerHour:100, type:"basement", amenities:["24h"], rating:4.4, state:"Odisha", district:"Balasore" },
  { _id:'381', name:"Ludhiana Market Parking", address:"Ludhiana, Punjab", lat:30.907901, lng:75.850127, availableSpots:28, occupiedSpots:2, totalSpots:30, pricePerHour:25, type:"covered", amenities:[], rating:5.0, state:"Punjab", district:"Ludhiana" },
  { _id:'382', name:"Ludhiana Mall Parking", address:"Ludhiana, Punjab", lat:30.90185, lng:75.853842, availableSpots:1, occupiedSpots:29, totalSpots:30, pricePerHour:80, type:"open", amenities:["24h"], rating:4.9, state:"Punjab", district:"Ludhiana" },
  { _id:'383', name:"Ludhiana Junction Parking", address:"Ludhiana, Punjab", lat:30.916189, lng:75.873763, availableSpots:35, occupiedSpots:5, totalSpots:40, pricePerHour:60, type:"basement", amenities:["ev", "24h"], rating:3.6, state:"Punjab", district:"Ludhiana" },
  { _id:'384', name:"Amritsar Business District Parking", address:"Amritsar, Punjab", lat:31.627777, lng:74.878033, availableSpots:33, occupiedSpots:7, totalSpots:40, pricePerHour:40, type:"covered", amenities:[], rating:4.5, state:"Punjab", district:"Amritsar" },
  { _id:'385', name:"Amritsar Town Hall Parking", address:"Amritsar, Punjab", lat:31.63033, lng:74.864296, availableSpots:24, occupiedSpots:1, totalSpots:25, pricePerHour:80, type:"open", amenities:["ev", "24h"], rating:4.2, state:"Punjab", district:"Amritsar" },
  { _id:'386', name:"Amritsar Railway Station Parking", address:"Amritsar, Punjab", lat:31.647974, lng:74.864329, availableSpots:25, occupiedSpots:0, totalSpots:25, pricePerHour:60, type:"basement", amenities:["ev"], rating:4.9, state:"Punjab", district:"Amritsar" },
  { _id:'387', name:"Jalandhar Bus Stand Parking", address:"Jalandhar, Punjab", lat:31.328495, lng:75.594911, availableSpots:33, occupiedSpots:17, totalSpots:50, pricePerHour:25, type:"covered", amenities:["24h"], rating:4.1, state:"Punjab", district:"Jalandhar" },
  { _id:'388', name:"Jalandhar Civic Center Parking", address:"Jalandhar, Punjab", lat:31.3162, lng:75.569411, availableSpots:14, occupiedSpots:6, totalSpots:20, pricePerHour:40, type:"open", amenities:[], rating:3.6, state:"Punjab", district:"Jalandhar" },
  { _id:'389', name:"Jalandhar City Parking", address:"Jalandhar, Punjab", lat:31.334983, lng:75.563819, availableSpots:12, occupiedSpots:18, totalSpots:30, pricePerHour:100, type:"basement", amenities:["24h"], rating:4.4, state:"Punjab", district:"Jalandhar" },
  { _id:'390', name:"Patiala Central Parking", address:"Patiala, Punjab", lat:30.354745, lng:76.374427, availableSpots:46, occupiedSpots:4, totalSpots:50, pricePerHour:80, type:"covered", amenities:["ev", "24h"], rating:3.8, state:"Punjab", district:"Patiala" },
  { _id:'391', name:"Patiala Smart Parking Hub", address:"Patiala, Punjab", lat:30.328156, lng:76.403181, availableSpots:30, occupiedSpots:0, totalSpots:30, pricePerHour:15, type:"open", amenities:[], rating:3.8, state:"Punjab", district:"Patiala" },
  { _id:'392', name:"Patiala Commercial Parking", address:"Patiala, Punjab", lat:30.327401, lng:76.396559, availableSpots:15, occupiedSpots:25, totalSpots:40, pricePerHour:100, type:"basement", amenities:["ev", "24h"], rating:4.6, state:"Punjab", district:"Patiala" },
  { _id:'393', name:"Bathinda Municipal Parking", address:"Bathinda, Punjab", lat:30.206865, lng:74.935073, availableSpots:24, occupiedSpots:6, totalSpots:30, pricePerHour:35, type:"covered", amenities:["ev"], rating:4.1, state:"Punjab", district:"Bathinda" },
  { _id:'394', name:"Bathinda Station Parking", address:"Bathinda, Punjab", lat:30.212346, lng:74.93987, availableSpots:11, occupiedSpots:19, totalSpots:30, pricePerHour:80, type:"open", amenities:["24h"], rating:4.8, state:"Punjab", district:"Bathinda" },
  { _id:'395', name:"Bathinda Metro Parking", address:"Bathinda, Punjab", lat:30.20964, lng:74.957613, availableSpots:20, occupiedSpots:20, totalSpots:40, pricePerHour:30, type:"basement", amenities:[], rating:4.1, state:"Punjab", district:"Bathinda" },
  { _id:'396', name:"Mohali Market Parking", address:"Mohali, Punjab", lat:30.701157, lng:76.720401, availableSpots:23, occupiedSpots:2, totalSpots:25, pricePerHour:25, type:"covered", amenities:["24h"], rating:3.5, state:"Punjab", district:"Mohali" },
  { _id:'397', name:"Mohali Mall Parking", address:"Mohali, Punjab", lat:30.706732, lng:76.721261, availableSpots:18, occupiedSpots:22, totalSpots:40, pricePerHour:25, type:"open", amenities:["ev", "24h"], rating:3.8, state:"Punjab", district:"Mohali" },
  { _id:'398', name:"Mohali Junction Parking", address:"Mohali, Punjab", lat:30.693801, lng:76.720692, availableSpots:15, occupiedSpots:10, totalSpots:25, pricePerHour:80, type:"basement", amenities:[], rating:4.5, state:"Punjab", district:"Mohali" },
  { _id:'399', name:"Hoshiarpur Business District Parking", address:"Hoshiarpur, Punjab", lat:31.521694, lng:75.901893, availableSpots:31, occupiedSpots:9, totalSpots:40, pricePerHour:60, type:"covered", amenities:["ev", "24h"], rating:3.8, state:"Punjab", district:"Hoshiarpur" },
  { _id:'400', name:"Hoshiarpur Town Hall Parking", address:"Hoshiarpur, Punjab", lat:31.526099, lng:75.898371, availableSpots:31, occupiedSpots:19, totalSpots:50, pricePerHour:25, type:"open", amenities:["ev"], rating:4.9, state:"Punjab", district:"Hoshiarpur" },
  { _id:'401', name:"Jaipur Town Hall Parking", address:"Jaipur, Rajasthan", lat:26.914085, lng:75.792972, availableSpots:16, occupiedSpots:4, totalSpots:20, pricePerHour:15, type:"basement", amenities:["24h"], rating:4.8, state:"Rajasthan", district:"Jaipur" },
  { _id:'402', name:"Jaipur Railway Station Parking", address:"Jaipur, Rajasthan", lat:26.895373, lng:75.80002, availableSpots:0, occupiedSpots:20, totalSpots:20, pricePerHour:50, type:"covered", amenities:[], rating:3.7, state:"Rajasthan", district:"Jaipur" },
  { _id:'403', name:"Jaipur Central Parking", address:"Jaipur, Rajasthan", lat:26.917628, lng:75.770019, availableSpots:0, occupiedSpots:25, totalSpots:25, pricePerHour:30, type:"open", amenities:["24h"], rating:4.3, state:"Rajasthan", district:"Jaipur" },
  { _id:'404', name:"Jodhpur Civic Center Parking", address:"Jodhpur, Rajasthan", lat:26.233828, lng:73.029013, availableSpots:30, occupiedSpots:20, totalSpots:50, pricePerHour:60, type:"basement", amenities:["ev", "24h"], rating:3.5, state:"Rajasthan", district:"Jodhpur" },
  { _id:'405', name:"Jodhpur City Parking", address:"Jodhpur, Rajasthan", lat:26.240188, lng:73.020754, availableSpots:16, occupiedSpots:4, totalSpots:20, pricePerHour:35, type:"covered", amenities:[], rating:4.3, state:"Rajasthan", district:"Jodhpur" },
  { _id:'406', name:"Jodhpur Municipal Parking", address:"Jodhpur, Rajasthan", lat:26.230368, lng:73.024389, availableSpots:11, occupiedSpots:29, totalSpots:40, pricePerHour:20, type:"open", amenities:["ev", "24h"], rating:4.9, state:"Rajasthan", district:"Jodhpur" },
  { _id:'407', name:"Udaipur Smart Parking Hub", address:"Udaipur, Rajasthan", lat:24.586375, lng:73.702139, availableSpots:33, occupiedSpots:17, totalSpots:50, pricePerHour:35, type:"basement", amenities:["ev"], rating:4.7, state:"Rajasthan", district:"Udaipur" },
  { _id:'408', name:"Udaipur Commercial Parking", address:"Udaipur, Rajasthan", lat:24.576093, lng:73.708376, availableSpots:30, occupiedSpots:0, totalSpots:30, pricePerHour:50, type:"covered", amenities:["24h"], rating:4.2, state:"Rajasthan", district:"Udaipur" },
  { _id:'409', name:"Udaipur Market Parking", address:"Udaipur, Rajasthan", lat:24.575128, lng:73.720389, availableSpots:21, occupiedSpots:9, totalSpots:30, pricePerHour:20, type:"open", amenities:[], rating:4.5, state:"Rajasthan", district:"Udaipur" },
  { _id:'410', name:"Kota Station Parking", address:"Kota, Rajasthan", lat:25.228129, lng:75.875183, availableSpots:12, occupiedSpots:8, totalSpots:20, pricePerHour:50, type:"basement", amenities:["24h"], rating:4.1, state:"Rajasthan", district:"Kota" },
  { _id:'411', name:"Kota Metro Parking", address:"Kota, Rajasthan", lat:25.21284, lng:75.87027, availableSpots:2, occupiedSpots:23, totalSpots:25, pricePerHour:60, type:"covered", amenities:["ev", "24h"], rating:4.8, state:"Rajasthan", district:"Kota" },
  { _id:'412', name:"Kota Business District Parking", address:"Kota, Rajasthan", lat:25.219596, lng:75.858051, availableSpots:16, occupiedSpots:4, totalSpots:20, pricePerHour:15, type:"open", amenities:[], rating:3.8, state:"Rajasthan", district:"Kota" },
  { _id:'413', name:"Ajmer Mall Parking", address:"Ajmer, Rajasthan", lat:26.465951, lng:74.647592, availableSpots:30, occupiedSpots:20, totalSpots:50, pricePerHour:35, type:"basement", amenities:["ev", "24h"], rating:3.6, state:"Rajasthan", district:"Ajmer" },
  { _id:'414', name:"Ajmer Junction Parking", address:"Ajmer, Rajasthan", lat:26.432874, lng:74.656923, availableSpots:36, occupiedSpots:14, totalSpots:50, pricePerHour:15, type:"covered", amenities:["ev"], rating:3.8, state:"Rajasthan", district:"Ajmer" },
  { _id:'415', name:"Ajmer Bus Stand Parking", address:"Ajmer, Rajasthan", lat:26.463917, lng:74.620526, availableSpots:18, occupiedSpots:7, totalSpots:25, pricePerHour:25, type:"open", amenities:["24h"], rating:4.6, state:"Rajasthan", district:"Ajmer" },
  { _id:'416', name:"Bikaner Town Hall Parking", address:"Bikaner, Rajasthan", lat:28.031408, lng:73.307832, availableSpots:9, occupiedSpots:11, totalSpots:20, pricePerHour:25, type:"basement", amenities:[], rating:4.3, state:"Rajasthan", district:"Bikaner" },
  { _id:'417', name:"Bikaner Railway Station Parking", address:"Bikaner, Rajasthan", lat:28.025568, lng:73.325878, availableSpots:21, occupiedSpots:29, totalSpots:50, pricePerHour:50, type:"covered", amenities:["24h"], rating:4.6, state:"Rajasthan", district:"Bikaner" },
  { _id:'418', name:"Bikaner Central Parking", address:"Bikaner, Rajasthan", lat:28.008498, lng:73.331439, availableSpots:16, occupiedSpots:4, totalSpots:20, pricePerHour:40, type:"open", amenities:["ev", "24h"], rating:3.6, state:"Rajasthan", district:"Bikaner" },
  { _id:'419', name:"Alwar Civic Center Parking", address:"Alwar, Rajasthan", lat:27.550484, lng:76.648147, availableSpots:19, occupiedSpots:11, totalSpots:30, pricePerHour:100, type:"basement", amenities:[], rating:4.9, state:"Rajasthan", district:"Alwar" },
  { _id:'420', name:"Alwar City Parking", address:"Alwar, Rajasthan", lat:27.548868, lng:76.645542, availableSpots:20, occupiedSpots:0, totalSpots:20, pricePerHour:35, type:"covered", amenities:["ev", "24h"], rating:4.7, state:"Rajasthan", district:"Alwar" },
  { _id:'421', name:"Gangtok City Parking", address:"Gangtok, Sikkim", lat:27.329422, lng:88.602926, availableSpots:24, occupiedSpots:26, totalSpots:50, pricePerHour:50, type:"open", amenities:["ev"], rating:3.8, state:"Sikkim", district:"Gangtok" },
  { _id:'422', name:"Gangtok Municipal Parking", address:"Gangtok, Sikkim", lat:27.334835, lng:88.609003, availableSpots:18, occupiedSpots:32, totalSpots:50, pricePerHour:30, type:"basement", amenities:["24h"], rating:4.6, state:"Sikkim", district:"Gangtok" },
  { _id:'423', name:"Gangtok Station Parking", address:"Gangtok, Sikkim", lat:27.314682, lng:88.599969, availableSpots:23, occupiedSpots:2, totalSpots:25, pricePerHour:50, type:"covered", amenities:[], rating:4.0, state:"Sikkim", district:"Gangtok" },
  { _id:'424', name:"Namchi Commercial Parking", address:"Namchi, Sikkim", lat:27.149262, lng:88.342308, availableSpots:14, occupiedSpots:16, totalSpots:30, pricePerHour:40, type:"open", amenities:["24h"], rating:4.6, state:"Sikkim", district:"Namchi" },
  { _id:'425', name:"Namchi Market Parking", address:"Namchi, Sikkim", lat:27.149089, lng:88.345592, availableSpots:28, occupiedSpots:12, totalSpots:40, pricePerHour:80, type:"basement", amenities:["ev", "24h"], rating:4.3, state:"Sikkim", district:"Namchi" },
  { _id:'426', name:"Namchi Mall Parking", address:"Namchi, Sikkim", lat:27.161322, lng:88.34315, availableSpots:17, occupiedSpots:13, totalSpots:30, pricePerHour:20, type:"covered", amenities:[], rating:4.4, state:"Sikkim", district:"Namchi" },
  { _id:'427', name:"Gyalshing Metro Parking", address:"Gyalshing, Sikkim", lat:27.295078, lng:88.273849, availableSpots:9, occupiedSpots:11, totalSpots:20, pricePerHour:50, type:"open", amenities:["ev", "24h"], rating:4.1, state:"Sikkim", district:"Gyalshing" },
  { _id:'428', name:"Gyalshing Business District Parking", address:"Gyalshing, Sikkim", lat:27.267088, lng:88.275345, availableSpots:18, occupiedSpots:7, totalSpots:25, pricePerHour:80, type:"basement", amenities:["ev"], rating:3.8, state:"Sikkim", district:"Gyalshing" },
  { _id:'429', name:"Gyalshing Town Hall Parking", address:"Gyalshing, Sikkim", lat:27.278929, lng:88.244854, availableSpots:8, occupiedSpots:22, totalSpots:30, pricePerHour:60, type:"covered", amenities:["24h"], rating:3.7, state:"Sikkim", district:"Gyalshing" },
  { _id:'430', name:"Mangan Junction Parking", address:"Mangan, Sikkim", lat:27.501888, lng:88.523038, availableSpots:15, occupiedSpots:15, totalSpots:30, pricePerHour:20, type:"open", amenities:[], rating:4.0, state:"Sikkim", district:"Mangan" },
  { _id:'431', name:"Mangan Bus Stand Parking", address:"Mangan, Sikkim", lat:27.532969, lng:88.540836, availableSpots:38, occupiedSpots:2, totalSpots:40, pricePerHour:100, type:"basement", amenities:["24h"], rating:3.8, state:"Sikkim", district:"Mangan" },
  { _id:'432', name:"Mangan Civic Center Parking", address:"Mangan, Sikkim", lat:27.499479, lng:88.524186, availableSpots:21, occupiedSpots:19, totalSpots:40, pricePerHour:100, type:"covered", amenities:["ev", "24h"], rating:4.1, state:"Sikkim", district:"Mangan" },
  { _id:'433', name:"Gangtok Railway Station Parking", address:"Gangtok, Sikkim", lat:27.345888, lng:88.611409, availableSpots:38, occupiedSpots:2, totalSpots:40, pricePerHour:25, type:"open", amenities:[], rating:4.0, state:"Sikkim", district:"Gangtok" },
  { _id:'434', name:"Gangtok Central Parking", address:"Gangtok, Sikkim", lat:27.335528, lng:88.621612, availableSpots:20, occupiedSpots:20, totalSpots:40, pricePerHour:25, type:"basement", amenities:["ev", "24h"], rating:4.9, state:"Sikkim", district:"Gangtok" },
  { _id:'435', name:"Gangtok Smart Parking Hub", address:"Gangtok, Sikkim", lat:27.350149, lng:88.605458, availableSpots:36, occupiedSpots:4, totalSpots:40, pricePerHour:30, type:"covered", amenities:["ev"], rating:4.0, state:"Sikkim", district:"Gangtok" },
  { _id:'436', name:"Namchi City Parking", address:"Namchi, Sikkim", lat:27.156212, lng:88.373535, availableSpots:3, occupiedSpots:27, totalSpots:30, pricePerHour:100, type:"open", amenities:["24h"], rating:3.8, state:"Sikkim", district:"Namchi" },
  { _id:'437', name:"Namchi Municipal Parking", address:"Namchi, Sikkim", lat:27.184891, lng:88.349297, availableSpots:1, occupiedSpots:49, totalSpots:50, pricePerHour:60, type:"basement", amenities:[], rating:4.9, state:"Sikkim", district:"Namchi" },
  { _id:'438', name:"Namchi Station Parking", address:"Namchi, Sikkim", lat:27.153386, lng:88.374007, availableSpots:13, occupiedSpots:7, totalSpots:20, pricePerHour:60, type:"covered", amenities:["24h"], rating:3.7, state:"Sikkim", district:"Namchi" },
  { _id:'439', name:"Gyalshing Commercial Parking", address:"Gyalshing, Sikkim", lat:27.275813, lng:88.249407, availableSpots:22, occupiedSpots:3, totalSpots:25, pricePerHour:50, type:"open", amenities:["ev", "24h"], rating:4.7, state:"Sikkim", district:"Gyalshing" },
  { _id:'440', name:"Gyalshing Market Parking", address:"Gyalshing, Sikkim", lat:27.266659, lng:88.278928, availableSpots:37, occupiedSpots:3, totalSpots:40, pricePerHour:50, type:"basement", amenities:[], rating:4.3, state:"Sikkim", district:"Gyalshing" },
  { _id:'441', name:"Chennai Market Parking", address:"Chennai, Tamil Nadu", lat:13.09964, lng:80.285485, availableSpots:34, occupiedSpots:6, totalSpots:40, pricePerHour:15, type:"covered", amenities:["ev", "24h"], rating:4.7, state:"Tamil Nadu", district:"Chennai" },
  { _id:'442', name:"Chennai Mall Parking", address:"Chennai, Tamil Nadu", lat:13.077081, lng:80.28652, availableSpots:38, occupiedSpots:12, totalSpots:50, pricePerHour:20, type:"open", amenities:["ev"], rating:3.7, state:"Tamil Nadu", district:"Chennai" },
  { _id:'443', name:"Chennai Junction Parking", address:"Chennai, Tamil Nadu", lat:13.072629, lng:80.277288, availableSpots:20, occupiedSpots:5, totalSpots:25, pricePerHour:100, type:"basement", amenities:["24h"], rating:3.6, state:"Tamil Nadu", district:"Chennai" },
  { _id:'444', name:"Coimbatore Business District Parking", address:"Coimbatore, Tamil Nadu", lat:11.036144, lng:76.962899, availableSpots:21, occupiedSpots:19, totalSpots:40, pricePerHour:50, type:"covered", amenities:[], rating:3.7, state:"Tamil Nadu", district:"Coimbatore" },
  { _id:'445', name:"Coimbatore Town Hall Parking", address:"Coimbatore, Tamil Nadu", lat:11.000744, lng:76.94468, availableSpots:35, occupiedSpots:15, totalSpots:50, pricePerHour:100, type:"open", amenities:["24h"], rating:4.5, state:"Tamil Nadu", district:"Coimbatore" },
  { _id:'446', name:"Coimbatore Railway Station Parking", address:"Coimbatore, Tamil Nadu", lat:11.005641, lng:76.950765, availableSpots:37, occupiedSpots:3, totalSpots:40, pricePerHour:80, type:"basement", amenities:["ev", "24h"], rating:3.7, state:"Tamil Nadu", district:"Coimbatore" },
  { _id:'447', name:"Madurai Bus Stand Parking", address:"Madurai, Tamil Nadu", lat:9.945108, lng:78.119111, availableSpots:13, occupiedSpots:17, totalSpots:30, pricePerHour:20, type:"covered", amenities:[], rating:3.7, state:"Tamil Nadu", district:"Madurai" },
  { _id:'448', name:"Madurai Civic Center Parking", address:"Madurai, Tamil Nadu", lat:9.942827, lng:78.105467, availableSpots:10, occupiedSpots:20, totalSpots:30, pricePerHour:60, type:"open", amenities:["ev", "24h"], rating:4.7, state:"Tamil Nadu", district:"Madurai" },
  { _id:'449', name:"Madurai City Parking", address:"Madurai, Tamil Nadu", lat:9.926045, lng:78.113732, availableSpots:14, occupiedSpots:6, totalSpots:20, pricePerHour:60, type:"basement", amenities:["ev"], rating:4.0, state:"Tamil Nadu", district:"Madurai" },
  { _id:'450', name:"Tiruchirappalli Central Parking", address:"Tiruchirappalli, Tamil Nadu", lat:10.782511, lng:78.717107, availableSpots:0, occupiedSpots:20, totalSpots:20, pricePerHour:40, type:"covered", amenities:["24h"], rating:4.5, state:"Tamil Nadu", district:"Tiruchirappalli" },
  { _id:'451', name:"Tiruchirappalli Smart Parking Hub", address:"Tiruchirappalli, Tamil Nadu", lat:10.797586, lng:78.691274, availableSpots:16, occupiedSpots:9, totalSpots:25, pricePerHour:25, type:"open", amenities:[], rating:4.3, state:"Tamil Nadu", district:"Tiruchirappalli" },
  { _id:'452', name:"Tiruchirappalli Commercial Parking", address:"Tiruchirappalli, Tamil Nadu", lat:10.78374, lng:78.701755, availableSpots:14, occupiedSpots:26, totalSpots:40, pricePerHour:50, type:"basement", amenities:["24h"], rating:4.4, state:"Tamil Nadu", district:"Tiruchirappalli" },
  { _id:'453', name:"Salem Municipal Parking", address:"Salem, Tamil Nadu", lat:11.651755, lng:78.152292, availableSpots:1, occupiedSpots:39, totalSpots:40, pricePerHour:100, type:"covered", amenities:["ev", "24h"], rating:4.8, state:"Tamil Nadu", district:"Salem" },
  { _id:'454', name:"Salem Station Parking", address:"Salem, Tamil Nadu", lat:11.662283, lng:78.143182, availableSpots:6, occupiedSpots:14, totalSpots:20, pricePerHour:30, type:"open", amenities:[], rating:3.9, state:"Tamil Nadu", district:"Salem" },
  { _id:'455', name:"Salem Metro Parking", address:"Salem, Tamil Nadu", lat:11.67245, lng:78.15784, availableSpots:6, occupiedSpots:44, totalSpots:50, pricePerHour:80, type:"basement", amenities:["ev", "24h"], rating:3.8, state:"Tamil Nadu", district:"Salem" },
  { _id:'456', name:"Tirunelveli Market Parking", address:"Tirunelveli, Tamil Nadu", lat:8.706939, lng:77.755002, availableSpots:21, occupiedSpots:9, totalSpots:30, pricePerHour:60, type:"covered", amenities:["ev"], rating:4.3, state:"Tamil Nadu", district:"Tirunelveli" },
  { _id:'457', name:"Tirunelveli Mall Parking", address:"Tirunelveli, Tamil Nadu", lat:8.719464, lng:77.760579, availableSpots:25, occupiedSpots:25, totalSpots:50, pricePerHour:100, type:"open", amenities:["24h"], rating:3.7, state:"Tamil Nadu", district:"Tirunelveli" },
  { _id:'458', name:"Tirunelveli Junction Parking", address:"Tirunelveli, Tamil Nadu", lat:8.707979, lng:77.755014, availableSpots:21, occupiedSpots:4, totalSpots:25, pricePerHour:35, type:"basement", amenities:[], rating:4.9, state:"Tamil Nadu", district:"Tirunelveli" },
  { _id:'459', name:"Erode Business District Parking", address:"Erode, Tamil Nadu", lat:11.344607, lng:77.724084, availableSpots:3, occupiedSpots:27, totalSpots:30, pricePerHour:30, type:"covered", amenities:["24h"], rating:4.0, state:"Tamil Nadu", district:"Erode" },
  { _id:'460', name:"Erode Town Hall Parking", address:"Erode, Tamil Nadu", lat:11.328322, lng:77.724937, availableSpots:24, occupiedSpots:26, totalSpots:50, pricePerHour:50, type:"open", amenities:["ev", "24h"], rating:4.4, state:"Tamil Nadu", district:"Erode" },
  { _id:'461', name:"Hyderabad Town Hall Parking", address:"Hyderabad, Telangana", lat:17.387992, lng:78.483622, availableSpots:40, occupiedSpots:0, totalSpots:40, pricePerHour:80, type:"basement", amenities:[], rating:4.5, state:"Telangana", district:"Hyderabad" },
  { _id:'462', name:"Hyderabad Railway Station Parking", address:"Hyderabad, Telangana", lat:17.39081, lng:78.506696, availableSpots:10, occupiedSpots:40, totalSpots:50, pricePerHour:60, type:"covered", amenities:["ev", "24h"], rating:3.9, state:"Telangana", district:"Hyderabad" },
  { _id:'463', name:"Hyderabad Central Parking", address:"Hyderabad, Telangana", lat:17.372484, lng:78.500379, availableSpots:3, occupiedSpots:47, totalSpots:50, pricePerHour:40, type:"open", amenities:["ev"], rating:4.9, state:"Telangana", district:"Hyderabad" },
  { _id:'464', name:"Warangal Civic Center Parking", address:"Warangal, Telangana", lat:17.968284, lng:79.581905, availableSpots:35, occupiedSpots:5, totalSpots:40, pricePerHour:80, type:"basement", amenities:["24h"], rating:4.5, state:"Telangana", district:"Warangal" },
  { _id:'465', name:"Warangal City Parking", address:"Warangal, Telangana", lat:17.965265, lng:79.593769, availableSpots:31, occupiedSpots:9, totalSpots:40, pricePerHour:25, type:"covered", amenities:[], rating:3.6, state:"Telangana", district:"Warangal" },
  { _id:'466', name:"Warangal Municipal Parking", address:"Warangal, Telangana", lat:17.950134, lng:79.604542, availableSpots:1, occupiedSpots:29, totalSpots:30, pricePerHour:35, type:"open", amenities:["24h"], rating:3.8, state:"Telangana", district:"Warangal" },
  { _id:'467', name:"Nizamabad Smart Parking Hub", address:"Nizamabad, Telangana", lat:18.664047, lng:78.10523, availableSpots:47, occupiedSpots:3, totalSpots:50, pricePerHour:60, type:"basement", amenities:["ev", "24h"], rating:4.3, state:"Telangana", district:"Nizamabad" },
  { _id:'468', name:"Nizamabad Commercial Parking", address:"Nizamabad, Telangana", lat:18.657028, lng:78.078568, availableSpots:23, occupiedSpots:27, totalSpots:50, pricePerHour:80, type:"covered", amenities:[], rating:4.7, state:"Telangana", district:"Nizamabad" },
  { _id:'469', name:"Nizamabad Market Parking", address:"Nizamabad, Telangana", lat:18.654164, lng:78.102759, availableSpots:13, occupiedSpots:37, totalSpots:50, pricePerHour:50, type:"open", amenities:["ev", "24h"], rating:3.7, state:"Telangana", district:"Nizamabad" },
  { _id:'470', name:"Karimnagar Station Parking", address:"Karimnagar, Telangana", lat:18.451803, lng:79.138854, availableSpots:27, occupiedSpots:3, totalSpots:30, pricePerHour:15, type:"basement", amenities:["ev"], rating:4.2, state:"Telangana", district:"Karimnagar" },
  { _id:'471', name:"Karimnagar Metro Parking", address:"Karimnagar, Telangana", lat:18.432543, lng:79.141469, availableSpots:7, occupiedSpots:33, totalSpots:40, pricePerHour:30, type:"covered", amenities:["24h"], rating:3.8, state:"Telangana", district:"Karimnagar" },
  { _id:'472', name:"Karimnagar Business District Parking", address:"Karimnagar, Telangana", lat:18.448105, lng:79.136365, availableSpots:40, occupiedSpots:10, totalSpots:50, pricePerHour:50, type:"open", amenities:[], rating:3.7, state:"Telangana", district:"Karimnagar" },
  { _id:'473', name:"Khammam Mall Parking", address:"Khammam, Telangana", lat:17.232869, lng:80.139665, availableSpots:25, occupiedSpots:0, totalSpots:25, pricePerHour:15, type:"basement", amenities:["24h"], rating:4.4, state:"Telangana", district:"Khammam" },
  { _id:'474', name:"Khammam Junction Parking", address:"Khammam, Telangana", lat:17.248591, lng:80.155274, availableSpots:10, occupiedSpots:15, totalSpots:25, pricePerHour:35, type:"covered", amenities:["ev", "24h"], rating:3.9, state:"Telangana", district:"Khammam" },
  { _id:'475', name:"Khammam Bus Stand Parking", address:"Khammam, Telangana", lat:17.237994, lng:80.165721, availableSpots:4, occupiedSpots:16, totalSpots:20, pricePerHour:50, type:"open", amenities:[], rating:4.9, state:"Telangana", district:"Khammam" },
  { _id:'476', name:"Mahbubnagar Town Hall Parking", address:"Mahbubnagar, Telangana", lat:16.764499, lng:78.009782, availableSpots:22, occupiedSpots:3, totalSpots:25, pricePerHour:25, type:"basement", amenities:["ev", "24h"], rating:3.9, state:"Telangana", district:"Mahbubnagar" },
  { _id:'477', name:"Mahbubnagar Railway Station Parking", address:"Mahbubnagar, Telangana", lat:16.753256, lng:78.008239, availableSpots:31, occupiedSpots:9, totalSpots:40, pricePerHour:25, type:"covered", amenities:["ev"], rating:4.4, state:"Telangana", district:"Mahbubnagar" },
  { _id:'478', name:"Mahbubnagar Central Parking", address:"Mahbubnagar, Telangana", lat:16.735549, lng:77.991669, availableSpots:4, occupiedSpots:36, totalSpots:40, pricePerHour:20, type:"open", amenities:["24h"], rating:4.1, state:"Telangana", district:"Mahbubnagar" },
  { _id:'479', name:"Nalgonda Civic Center Parking", address:"Nalgonda, Telangana", lat:17.067492, lng:79.274788, availableSpots:14, occupiedSpots:16, totalSpots:30, pricePerHour:60, type:"basement", amenities:[], rating:4.0, state:"Telangana", district:"Nalgonda" },
  { _id:'480', name:"Nalgonda City Parking", address:"Nalgonda, Telangana", lat:17.037599, lng:79.277965, availableSpots:14, occupiedSpots:6, totalSpots:20, pricePerHour:40, type:"covered", amenities:["24h"], rating:4.8, state:"Telangana", district:"Nalgonda" },
  { _id:'481', name:"Agartala City Parking", address:"Agartala, Tripura", lat:23.843327, lng:91.282709, availableSpots:13, occupiedSpots:27, totalSpots:40, pricePerHour:60, type:"open", amenities:["ev", "24h"], rating:3.9, state:"Tripura", district:"Agartala" },
  { _id:'482', name:"Agartala Municipal Parking", address:"Agartala, Tripura", lat:23.844634, lng:91.28031, availableSpots:8, occupiedSpots:42, totalSpots:50, pricePerHour:100, type:"basement", amenities:[], rating:4.8, state:"Tripura", district:"Agartala" },
  { _id:'483', name:"Agartala Station Parking", address:"Agartala, Tripura", lat:23.843032, lng:91.302566, availableSpots:1, occupiedSpots:19, totalSpots:20, pricePerHour:20, type:"covered", amenities:["ev", "24h"], rating:4.4, state:"Tripura", district:"Agartala" },
  { _id:'484', name:"Dharmanagar Commercial Parking", address:"Dharmanagar, Tripura", lat:24.388468, lng:92.142451, availableSpots:14, occupiedSpots:11, totalSpots:25, pricePerHour:60, type:"open", amenities:["ev"], rating:3.5, state:"Tripura", district:"Dharmanagar" },
  { _id:'485', name:"Dharmanagar Market Parking", address:"Dharmanagar, Tripura", lat:24.393321, lng:92.149893, availableSpots:20, occupiedSpots:5, totalSpots:25, pricePerHour:35, type:"basement", amenities:["24h"], rating:3.7, state:"Tripura", district:"Dharmanagar" },
  { _id:'486', name:"Dharmanagar Mall Parking", address:"Dharmanagar, Tripura", lat:24.392309, lng:92.152761, availableSpots:8, occupiedSpots:22, totalSpots:30, pricePerHour:20, type:"covered", amenities:[], rating:4.1, state:"Tripura", district:"Dharmanagar" },
  { _id:'487', name:"Udaipur Metro Parking", address:"Udaipur, Tripura", lat:23.546352, lng:91.468121, availableSpots:40, occupiedSpots:0, totalSpots:40, pricePerHour:35, type:"open", amenities:["24h"], rating:4.6, state:"Tripura", district:"Udaipur" },
  { _id:'488', name:"Udaipur Business District Parking", address:"Udaipur, Tripura", lat:23.540409, lng:91.478669, availableSpots:3, occupiedSpots:17, totalSpots:20, pricePerHour:15, type:"basement", amenities:["ev", "24h"], rating:3.8, state:"Tripura", district:"Udaipur" },
  { _id:'489', name:"Udaipur Town Hall Parking", address:"Udaipur, Tripura", lat:23.513318, lng:91.485247, availableSpots:43, occupiedSpots:7, totalSpots:50, pricePerHour:60, type:"covered", amenities:[], rating:3.5, state:"Tripura", district:"Udaipur" },
  { _id:'490', name:"Kailashahar Junction Parking", address:"Kailashahar, Tripura", lat:24.340724, lng:92.016184, availableSpots:8, occupiedSpots:32, totalSpots:40, pricePerHour:60, type:"open", amenities:["ev", "24h"], rating:3.6, state:"Tripura", district:"Kailashahar" },
  { _id:'491', name:"Kailashahar Bus Stand Parking", address:"Kailashahar, Tripura", lat:24.328223, lng:92.012731, availableSpots:3, occupiedSpots:17, totalSpots:20, pricePerHour:40, type:"basement", amenities:["ev"], rating:4.1, state:"Tripura", district:"Kailashahar" },
  { _id:'492', name:"Kailashahar Civic Center Parking", address:"Kailashahar, Tripura", lat:24.32487, lng:91.998809, availableSpots:20, occupiedSpots:5, totalSpots:25, pricePerHour:25, type:"covered", amenities:["24h"], rating:3.6, state:"Tripura", district:"Kailashahar" },
  { _id:'493', name:"Agartala Railway Station Parking", address:"Agartala, Tripura", lat:23.834032, lng:91.291213, availableSpots:14, occupiedSpots:11, totalSpots:25, pricePerHour:40, type:"open", amenities:[], rating:4.6, state:"Tripura", district:"Agartala" },
  { _id:'494', name:"Agartala Central Parking", address:"Agartala, Tripura", lat:23.836623, lng:91.272855, availableSpots:39, occupiedSpots:1, totalSpots:40, pricePerHour:60, type:"basement", amenities:["24h"], rating:4.8, state:"Tripura", district:"Agartala" },
  { _id:'495', name:"Agartala Smart Parking Hub", address:"Agartala, Tripura", lat:23.814968, lng:91.270819, availableSpots:18, occupiedSpots:2, totalSpots:20, pricePerHour:50, type:"covered", amenities:["ev", "24h"], rating:4.0, state:"Tripura", district:"Agartala" },
  { _id:'496', name:"Dharmanagar City Parking", address:"Dharmanagar, Tripura", lat:24.372176, lng:92.173443, availableSpots:8, occupiedSpots:17, totalSpots:25, pricePerHour:20, type:"open", amenities:[], rating:3.9, state:"Tripura", district:"Dharmanagar" },
  { _id:'497', name:"Dharmanagar Municipal Parking", address:"Dharmanagar, Tripura", lat:24.37904, lng:92.170647, availableSpots:24, occupiedSpots:6, totalSpots:30, pricePerHour:15, type:"basement", amenities:["ev", "24h"], rating:4.8, state:"Tripura", district:"Dharmanagar" },
  { _id:'498', name:"Dharmanagar Station Parking", address:"Dharmanagar, Tripura", lat:24.381336, lng:92.153866, availableSpots:38, occupiedSpots:12, totalSpots:50, pricePerHour:80, type:"covered", amenities:["ev"], rating:3.8, state:"Tripura", district:"Dharmanagar" },
  { _id:'499', name:"Udaipur Commercial Parking", address:"Udaipur, Tripura", lat:23.52587, lng:91.487347, availableSpots:15, occupiedSpots:10, totalSpots:25, pricePerHour:50, type:"open", amenities:["24h"], rating:3.7, state:"Tripura", district:"Udaipur" },
  { _id:'500', name:"Udaipur Market Parking", address:"Udaipur, Tripura", lat:23.530183, lng:91.485257, availableSpots:0, occupiedSpots:50, totalSpots:50, pricePerHour:40, type:"basement", amenities:[], rating:4.9, state:"Tripura", district:"Udaipur" },
  { _id:'501', name:"Lucknow Market Parking", address:"Lucknow, Uttar Pradesh", lat:26.831979, lng:80.960633, availableSpots:26, occupiedSpots:24, totalSpots:50, pricePerHour:40, type:"covered", amenities:["24h"], rating:4.3, state:"Uttar Pradesh", district:"Lucknow" },
  { _id:'502', name:"Lucknow Mall Parking", address:"Lucknow, Uttar Pradesh", lat:26.833611, lng:80.945041, availableSpots:0, occupiedSpots:20, totalSpots:20, pricePerHour:100, type:"open", amenities:["ev", "24h"], rating:3.6, state:"Uttar Pradesh", district:"Lucknow" },
  { _id:'503', name:"Lucknow Junction Parking", address:"Lucknow, Uttar Pradesh", lat:26.837187, lng:80.927793, availableSpots:12, occupiedSpots:8, totalSpots:20, pricePerHour:80, type:"basement", amenities:[], rating:3.9, state:"Uttar Pradesh", district:"Lucknow" },
  { _id:'504', name:"Kanpur Business District Parking", address:"Kanpur, Uttar Pradesh", lat:26.458405, lng:80.342584, availableSpots:25, occupiedSpots:15, totalSpots:40, pricePerHour:20, type:"covered", amenities:["ev", "24h"], rating:4.5, state:"Uttar Pradesh", district:"Kanpur" },
  { _id:'505', name:"Kanpur Town Hall Parking", address:"Kanpur, Uttar Pradesh", lat:26.451406, lng:80.318007, availableSpots:9, occupiedSpots:11, totalSpots:20, pricePerHour:20, type:"open", amenities:["ev"], rating:4.3, state:"Uttar Pradesh", district:"Kanpur" },
  { _id:'506', name:"Kanpur Railway Station Parking", address:"Kanpur, Uttar Pradesh", lat:26.438028, lng:80.344222, availableSpots:20, occupiedSpots:30, totalSpots:50, pricePerHour:50, type:"basement", amenities:["24h"], rating:4.4, state:"Uttar Pradesh", district:"Kanpur" },
  { _id:'507', name:"Agra Bus Stand Parking", address:"Agra, Uttar Pradesh", lat:27.187229, lng:78.014094, availableSpots:9, occupiedSpots:11, totalSpots:20, pricePerHour:50, type:"covered", amenities:[], rating:4.6, state:"Uttar Pradesh", district:"Agra" },
  { _id:'508', name:"Agra Civic Center Parking", address:"Agra, Uttar Pradesh", lat:27.190559, lng:77.990416, availableSpots:13, occupiedSpots:7, totalSpots:20, pricePerHour:20, type:"open", amenities:["24h"], rating:4.2, state:"Uttar Pradesh", district:"Agra" },
  { _id:'509', name:"Agra City Parking", address:"Agra, Uttar Pradesh", lat:27.181053, lng:78.000472, availableSpots:3, occupiedSpots:22, totalSpots:25, pricePerHour:15, type:"basement", amenities:["ev", "24h"], rating:4.6, state:"Uttar Pradesh", district:"Agra" },
  { _id:'510', name:"Varanasi Central Parking", address:"Varanasi, Uttar Pradesh", lat:25.32566, lng:82.960453, availableSpots:16, occupiedSpots:14, totalSpots:30, pricePerHour:80, type:"covered", amenities:[], rating:4.7, state:"Uttar Pradesh", district:"Varanasi" },
  { _id:'511', name:"Varanasi Smart Parking Hub", address:"Varanasi, Uttar Pradesh", lat:25.326431, lng:82.960579, availableSpots:23, occupiedSpots:2, totalSpots:25, pricePerHour:35, type:"open", amenities:["ev", "24h"], rating:4.6, state:"Uttar Pradesh", district:"Varanasi" },
  { _id:'512', name:"Varanasi Commercial Parking", address:"Varanasi, Uttar Pradesh", lat:25.302322, lng:82.989896, availableSpots:25, occupiedSpots:5, totalSpots:30, pricePerHour:50, type:"basement", amenities:["ev"], rating:3.9, state:"Uttar Pradesh", district:"Varanasi" },
  { _id:'513', name:"Prayagraj Municipal Parking", address:"Prayagraj, Uttar Pradesh", lat:25.418355, lng:81.854793, availableSpots:40, occupiedSpots:10, totalSpots:50, pricePerHour:20, type:"covered", amenities:["24h"], rating:4.2, state:"Uttar Pradesh", district:"Prayagraj" },
  { _id:'514', name:"Prayagraj Station Parking", address:"Prayagraj, Uttar Pradesh", lat:25.436231, lng:81.828518, availableSpots:10, occupiedSpots:40, totalSpots:50, pricePerHour:40, type:"open", amenities:[], rating:3.7, state:"Uttar Pradesh", district:"Prayagraj" },
  { _id:'515', name:"Prayagraj Metro Parking", address:"Prayagraj, Uttar Pradesh", lat:25.446733, lng:81.862071, availableSpots:7, occupiedSpots:13, totalSpots:20, pricePerHour:80, type:"basement", amenities:["24h"], rating:3.5, state:"Uttar Pradesh", district:"Prayagraj" },
  { _id:'516', name:"Meerut Market Parking", address:"Meerut, Uttar Pradesh", lat:28.998848, lng:77.686892, availableSpots:15, occupiedSpots:5, totalSpots:20, pricePerHour:40, type:"covered", amenities:["ev", "24h"], rating:4.1, state:"Uttar Pradesh", district:"Meerut" },
  { _id:'517', name:"Meerut Mall Parking", address:"Meerut, Uttar Pradesh", lat:28.970503, lng:77.723646, availableSpots:17, occupiedSpots:3, totalSpots:20, pricePerHour:50, type:"open", amenities:[], rating:3.8, state:"Uttar Pradesh", district:"Meerut" },
  { _id:'518', name:"Meerut Junction Parking", address:"Meerut, Uttar Pradesh", lat:28.974431, lng:77.723034, availableSpots:8, occupiedSpots:22, totalSpots:30, pricePerHour:20, type:"basement", amenities:["ev", "24h"], rating:4.4, state:"Uttar Pradesh", district:"Meerut" },
  { _id:'519', name:"Ghaziabad Business District Parking", address:"Ghaziabad, Uttar Pradesh", lat:28.653976, lng:77.460733, availableSpots:5, occupiedSpots:15, totalSpots:20, pricePerHour:30, type:"covered", amenities:["ev"], rating:4.7, state:"Uttar Pradesh", district:"Ghaziabad" },
  { _id:'520', name:"Ghaziabad Town Hall Parking", address:"Ghaziabad, Uttar Pradesh", lat:28.688457, lng:77.471963, availableSpots:14, occupiedSpots:6, totalSpots:20, pricePerHour:35, type:"open", amenities:["24h"], rating:4.7, state:"Uttar Pradesh", district:"Ghaziabad" },
  { _id:'521', name:"Dehradun Town Hall Parking", address:"Dehradun, Uttarakhand", lat:30.308928, lng:78.015655, availableSpots:0, occupiedSpots:40, totalSpots:40, pricePerHour:40, type:"basement", amenities:[], rating:3.8, state:"Uttarakhand", district:"Dehradun" },
  { _id:'522', name:"Dehradun Railway Station Parking", address:"Dehradun, Uttarakhand", lat:30.319052, lng:78.024356, availableSpots:15, occupiedSpots:35, totalSpots:50, pricePerHour:60, type:"covered", amenities:["24h"], rating:4.1, state:"Uttarakhand", district:"Dehradun" },
  { _id:'523', name:"Dehradun Central Parking", address:"Dehradun, Uttarakhand", lat:30.335374, lng:78.052111, availableSpots:23, occupiedSpots:2, totalSpots:25, pricePerHour:80, type:"open", amenities:["ev", "24h"], rating:4.6, state:"Uttarakhand", district:"Dehradun" },
  { _id:'524', name:"Haridwar Civic Center Parking", address:"Haridwar, Uttarakhand", lat:29.935505, lng:78.144455, availableSpots:1, occupiedSpots:39, totalSpots:40, pricePerHour:30, type:"basement", amenities:[], rating:4.3, state:"Uttarakhand", district:"Haridwar" },
  { _id:'525', name:"Haridwar City Parking", address:"Haridwar, Uttarakhand", lat:29.951138, lng:78.171938, availableSpots:10, occupiedSpots:10, totalSpots:20, pricePerHour:15, type:"covered", amenities:["ev", "24h"], rating:4.6, state:"Uttarakhand", district:"Haridwar" },
  { _id:'526', name:"Haridwar Municipal Parking", address:"Haridwar, Uttarakhand", lat:29.940751, lng:78.173723, availableSpots:3, occupiedSpots:27, totalSpots:30, pricePerHour:30, type:"open", amenities:["ev"], rating:4.3, state:"Uttarakhand", district:"Haridwar" },
  { _id:'527', name:"Rishikesh Smart Parking Hub", address:"Rishikesh, Uttarakhand", lat:30.076427, lng:78.267281, availableSpots:4, occupiedSpots:16, totalSpots:20, pricePerHour:35, type:"basement", amenities:["24h"], rating:3.6, state:"Uttarakhand", district:"Rishikesh" },
  { _id:'528', name:"Rishikesh Commercial Parking", address:"Rishikesh, Uttarakhand", lat:30.103751, lng:78.283491, availableSpots:26, occupiedSpots:24, totalSpots:50, pricePerHour:40, type:"covered", amenities:[], rating:4.2, state:"Uttarakhand", district:"Rishikesh" },
  { _id:'529', name:"Rishikesh Market Parking", address:"Rishikesh, Uttarakhand", lat:30.096816, lng:78.270831, availableSpots:8, occupiedSpots:42, totalSpots:50, pricePerHour:50, type:"open", amenities:["24h"], rating:3.6, state:"Uttarakhand", district:"Rishikesh" },
  { _id:'530', name:"Roorkee Station Parking", address:"Roorkee, Uttarakhand", lat:29.857013, lng:77.885399, availableSpots:7, occupiedSpots:18, totalSpots:25, pricePerHour:35, type:"basement", amenities:["ev", "24h"], rating:3.9, state:"Uttarakhand", district:"Roorkee" },
  { _id:'531', name:"Roorkee Metro Parking", address:"Roorkee, Uttarakhand", lat:29.8469, lng:77.900033, availableSpots:10, occupiedSpots:20, totalSpots:30, pricePerHour:60, type:"covered", amenities:[], rating:3.9, state:"Uttarakhand", district:"Roorkee" },
  { _id:'532', name:"Roorkee Business District Parking", address:"Roorkee, Uttarakhand", lat:29.837287, lng:77.876109, availableSpots:6, occupiedSpots:44, totalSpots:50, pricePerHour:25, type:"open", amenities:["ev", "24h"], rating:3.7, state:"Uttarakhand", district:"Roorkee" },
  { _id:'533', name:"Haldwani Mall Parking", address:"Haldwani, Uttarakhand", lat:29.216283, lng:79.505561, availableSpots:17, occupiedSpots:3, totalSpots:20, pricePerHour:40, type:"basement", amenities:["ev"], rating:4.9, state:"Uttarakhand", district:"Haldwani" },
  { _id:'534', name:"Haldwani Junction Parking", address:"Haldwani, Uttarakhand", lat:29.206605, lng:79.505332, availableSpots:27, occupiedSpots:3, totalSpots:30, pricePerHour:20, type:"covered", amenities:["24h"], rating:3.6, state:"Uttarakhand", district:"Haldwani" },
  { _id:'535', name:"Haldwani Bus Stand Parking", address:"Haldwani, Uttarakhand", lat:29.230604, lng:79.505169, availableSpots:2, occupiedSpots:48, totalSpots:50, pricePerHour:30, type:"open", amenities:[], rating:4.8, state:"Uttarakhand", district:"Haldwani" },
  { _id:'536', name:"Nainital Town Hall Parking", address:"Nainital, Uttarakhand", lat:29.385012, lng:79.437849, availableSpots:11, occupiedSpots:14, totalSpots:25, pricePerHour:50, type:"basement", amenities:["24h"], rating:4.3, state:"Uttarakhand", district:"Nainital" },
  { _id:'537', name:"Nainital Railway Station Parking", address:"Nainital, Uttarakhand", lat:29.398987, lng:79.444607, availableSpots:0, occupiedSpots:25, totalSpots:25, pricePerHour:50, type:"covered", amenities:["ev", "24h"], rating:4.8, state:"Uttarakhand", district:"Nainital" },
  { _id:'538', name:"Nainital Central Parking", address:"Nainital, Uttarakhand", lat:29.394138, lng:79.456205, availableSpots:14, occupiedSpots:6, totalSpots:20, pricePerHour:20, type:"open", amenities:[], rating:4.7, state:"Uttarakhand", district:"Nainital" },
  { _id:'539', name:"Dehradun Civic Center Parking", address:"Dehradun, Uttarakhand", lat:30.302092, lng:78.012678, availableSpots:4, occupiedSpots:21, totalSpots:25, pricePerHour:30, type:"basement", amenities:["ev", "24h"], rating:4.7, state:"Uttarakhand", district:"Dehradun" },
  { _id:'540', name:"Dehradun City Parking", address:"Dehradun, Uttarakhand", lat:30.31139, lng:78.037412, availableSpots:18, occupiedSpots:2, totalSpots:20, pricePerHour:100, type:"covered", amenities:["ev"], rating:3.9, state:"Uttarakhand", district:"Dehradun" },
  { _id:'541', name:"Kolkata City Parking", address:"Kolkata, West Bengal", lat:22.58511, lng:88.344772, availableSpots:6, occupiedSpots:14, totalSpots:20, pricePerHour:60, type:"open", amenities:["24h"], rating:4.7, state:"West Bengal", district:"Kolkata" },
  { _id:'542', name:"Kolkata Municipal Parking", address:"Kolkata, West Bengal", lat:22.556279, lng:88.377791, availableSpots:3, occupiedSpots:27, totalSpots:30, pricePerHour:15, type:"basement", amenities:[], rating:4.9, state:"West Bengal", district:"Kolkata" },
  { _id:'543', name:"Kolkata Station Parking", address:"Kolkata, West Bengal", lat:22.554626, lng:88.380865, availableSpots:25, occupiedSpots:15, totalSpots:40, pricePerHour:60, type:"covered", amenities:["24h"], rating:3.5, state:"West Bengal", district:"Kolkata" },
  { _id:'544', name:"Howrah Commercial Parking", address:"Howrah, West Bengal", lat:22.603129, lng:88.250512, availableSpots:5, occupiedSpots:20, totalSpots:25, pricePerHour:35, type:"open", amenities:["ev", "24h"], rating:3.9, state:"West Bengal", district:"Howrah" },
  { _id:'545', name:"Howrah Market Parking", address:"Howrah, West Bengal", lat:22.611137, lng:88.244986, availableSpots:39, occupiedSpots:11, totalSpots:50, pricePerHour:30, type:"basement", amenities:[], rating:4.5, state:"West Bengal", district:"Howrah" },
  { _id:'546', name:"Howrah Mall Parking", address:"Howrah, West Bengal", lat:22.595756, lng:88.278911, availableSpots:3, occupiedSpots:37, totalSpots:40, pricePerHour:20, type:"covered", amenities:["ev", "24h"], rating:3.9, state:"West Bengal", district:"Howrah" },
  { _id:'547', name:"Durgapur Metro Parking", address:"Durgapur, West Bengal", lat:23.505889, lng:87.299878, availableSpots:15, occupiedSpots:35, totalSpots:50, pricePerHour:80, type:"open", amenities:["ev"], rating:4.7, state:"West Bengal", district:"Durgapur" },
  { _id:'548', name:"Durgapur Business District Parking", address:"Durgapur, West Bengal", lat:23.539976, lng:87.323177, availableSpots:15, occupiedSpots:15, totalSpots:30, pricePerHour:80, type:"basement", amenities:["24h"], rating:4.7, state:"West Bengal", district:"Durgapur" },
  { _id:'549', name:"Durgapur Town Hall Parking", address:"Durgapur, West Bengal", lat:23.514161, lng:87.314526, availableSpots:12, occupiedSpots:18, totalSpots:30, pricePerHour:35, type:"covered", amenities:[], rating:3.8, state:"West Bengal", district:"Durgapur" },
  { _id:'550', name:"Asansol Junction Parking", address:"Asansol, West Bengal", lat:23.681655, lng:86.954861, availableSpots:1, occupiedSpots:29, totalSpots:30, pricePerHour:60, type:"open", amenities:["24h"], rating:4.3, state:"West Bengal", district:"Asansol" },
  { _id:'551', name:"Asansol Bus Stand Parking", address:"Asansol, West Bengal", lat:23.699574, lng:86.986084, availableSpots:3, occupiedSpots:22, totalSpots:25, pricePerHour:30, type:"basement", amenities:["ev", "24h"], rating:4.5, state:"West Bengal", district:"Asansol" },
  { _id:'552', name:"Asansol Civic Center Parking", address:"Asansol, West Bengal", lat:23.679561, lng:86.978751, availableSpots:7, occupiedSpots:13, totalSpots:20, pricePerHour:100, type:"covered", amenities:[], rating:4.8, state:"West Bengal", district:"Asansol" },
  { _id:'553', name:"Siliguri Railway Station Parking", address:"Siliguri, West Bengal", lat:26.738996, lng:88.389492, availableSpots:5, occupiedSpots:20, totalSpots:25, pricePerHour:30, type:"open", amenities:["ev", "24h"], rating:4.4, state:"West Bengal", district:"Siliguri" },
  { _id:'554', name:"Siliguri Central Parking", address:"Siliguri, West Bengal", lat:26.739348, lng:88.403205, availableSpots:1, occupiedSpots:49, totalSpots:50, pricePerHour:40, type:"basement", amenities:["ev"], rating:4.9, state:"West Bengal", district:"Siliguri" },
  { _id:'555', name:"Siliguri Smart Parking Hub", address:"Siliguri, West Bengal", lat:26.729644, lng:88.397824, availableSpots:25, occupiedSpots:0, totalSpots:25, pricePerHour:60, type:"covered", amenities:["24h"], rating:4.3, state:"West Bengal", district:"Siliguri" },
  { _id:'556', name:"Bardhaman City Parking", address:"Bardhaman, West Bengal", lat:23.219422, lng:87.843019, availableSpots:7, occupiedSpots:13, totalSpots:20, pricePerHour:100, type:"open", amenities:[], rating:3.8, state:"West Bengal", district:"Bardhaman" },
  { _id:'557', name:"Bardhaman Municipal Parking", address:"Bardhaman, West Bengal", lat:23.233458, lng:87.841527, availableSpots:12, occupiedSpots:38, totalSpots:50, pricePerHour:25, type:"basement", amenities:["24h"], rating:4.0, state:"West Bengal", district:"Bardhaman" },
  { _id:'558', name:"Bardhaman Station Parking", address:"Bardhaman, West Bengal", lat:23.219498, lng:87.873597, availableSpots:1, occupiedSpots:29, totalSpots:30, pricePerHour:15, type:"covered", amenities:["ev", "24h"], rating:3.7, state:"West Bengal", district:"Bardhaman" },
  { _id:'559', name:"Kharagpur Commercial Parking", address:"Kharagpur, West Bengal", lat:22.354188, lng:87.217666, availableSpots:16, occupiedSpots:4, totalSpots:20, pricePerHour:40, type:"open", amenities:[], rating:4.9, state:"West Bengal", district:"Kharagpur" },
  { _id:'560', name:"Kharagpur Market Parking", address:"Kharagpur, West Bengal", lat:22.340944, lng:87.249677, availableSpots:37, occupiedSpots:3, totalSpots:40, pricePerHour:20, type:"basement", amenities:["ev", "24h"], rating:4.0, state:"West Bengal", district:"Kharagpur" },
  { _id:'561', name:"Connaught Place Market Parking", address:"Connaught Place, Delhi", lat:28.625804, lng:77.238534, availableSpots:40, occupiedSpots:0, totalSpots:40, pricePerHour:60, type:"covered", amenities:["ev"], rating:4.5, state:"Delhi", district:"Connaught Place" },
  { _id:'562', name:"Connaught Place Mall Parking", address:"Connaught Place, Delhi", lat:28.619868, lng:77.23825, availableSpots:50, occupiedSpots:0, totalSpots:50, pricePerHour:40, type:"open", amenities:["24h"], rating:3.8, state:"Delhi", district:"Connaught Place" },
  { _id:'563', name:"Connaught Place Junction Parking", address:"Connaught Place, Delhi", lat:28.636458, lng:77.206514, availableSpots:23, occupiedSpots:7, totalSpots:30, pricePerHour:35, type:"basement", amenities:[], rating:3.7, state:"Delhi", district:"Connaught Place" },
  { _id:'564', name:"Dwarka Business District Parking", address:"Dwarka, Delhi", lat:28.601253, lng:77.063952, availableSpots:25, occupiedSpots:25, totalSpots:50, pricePerHour:100, type:"covered", amenities:["24h"], rating:3.5, state:"Delhi", district:"Dwarka" },
  { _id:'565', name:"Dwarka Town Hall Parking", address:"Dwarka, Delhi", lat:28.596196, lng:77.062842, availableSpots:14, occupiedSpots:36, totalSpots:50, pricePerHour:100, type:"open", amenities:["ev", "24h"], rating:3.7, state:"Delhi", district:"Dwarka" },
  { _id:'566', name:"Dwarka Railway Station Parking", address:"Dwarka, Delhi", lat:28.591947, lng:77.039247, availableSpots:7, occupiedSpots:13, totalSpots:20, pricePerHour:40, type:"basement", amenities:[], rating:5.0, state:"Delhi", district:"Dwarka" },
  { _id:'567', name:"Rohini Bus Stand Parking", address:"Rohini, Delhi", lat:28.736215, lng:77.080513, availableSpots:20, occupiedSpots:0, totalSpots:20, pricePerHour:40, type:"covered", amenities:["ev", "24h"], rating:4.2, state:"Delhi", district:"Rohini" },
  { _id:'568', name:"Rohini Civic Center Parking", address:"Rohini, Delhi", lat:28.740108, lng:77.055082, availableSpots:11, occupiedSpots:9, totalSpots:20, pricePerHour:35, type:"open", amenities:["ev"], rating:4.7, state:"Delhi", district:"Rohini" },
  { _id:'569', name:"Rohini City Parking", address:"Rohini, Delhi", lat:28.758317, lng:77.047026, availableSpots:26, occupiedSpots:14, totalSpots:40, pricePerHour:25, type:"basement", amenities:["24h"], rating:4.8, state:"Delhi", district:"Rohini" },
  { _id:'570', name:"Saket Central Parking", address:"Saket, Delhi", lat:28.526923, lng:77.214249, availableSpots:24, occupiedSpots:26, totalSpots:50, pricePerHour:20, type:"covered", amenities:[], rating:4.7, state:"Delhi", district:"Saket" },
  { _id:'571', name:"Saket Smart Parking Hub", address:"Saket, Delhi", lat:28.538749, lng:77.222222, availableSpots:5, occupiedSpots:20, totalSpots:25, pricePerHour:60, type:"open", amenities:["24h"], rating:3.6, state:"Delhi", district:"Saket" },
  { _id:'572', name:"Saket Commercial Parking", address:"Saket, Delhi", lat:28.54103, lng:77.210896, availableSpots:8, occupiedSpots:22, totalSpots:30, pricePerHour:20, type:"basement", amenities:["ev", "24h"], rating:3.6, state:"Delhi", district:"Saket" },
  { _id:'573', name:"Laxmi Nagar Municipal Parking", address:"Laxmi Nagar, Delhi", lat:28.618204, lng:77.274818, availableSpots:17, occupiedSpots:3, totalSpots:20, pricePerHour:20, type:"covered", amenities:[], rating:4.0, state:"Delhi", district:"Laxmi Nagar" },
  { _id:'574', name:"Laxmi Nagar Station Parking", address:"Laxmi Nagar, Delhi", lat:28.650811, lng:77.295529, availableSpots:13, occupiedSpots:7, totalSpots:20, pricePerHour:25, type:"open", amenities:["ev", "24h"], rating:4.4, state:"Delhi", district:"Laxmi Nagar" },
  { _id:'575', name:"Laxmi Nagar Metro Parking", address:"Laxmi Nagar, Delhi", lat:28.628768, lng:77.261942, availableSpots:6, occupiedSpots:24, totalSpots:30, pricePerHour:30, type:"basement", amenities:["ev"], rating:4.1, state:"Delhi", district:"Laxmi Nagar" },
  { _id:'576', name:"Janakpuri Market Parking", address:"Janakpuri, Delhi", lat:28.624064, lng:77.098023, availableSpots:16, occupiedSpots:34, totalSpots:50, pricePerHour:35, type:"covered", amenities:["24h"], rating:3.9, state:"Delhi", district:"Janakpuri" },
  { _id:'577', name:"Janakpuri Mall Parking", address:"Janakpuri, Delhi", lat:28.605737, lng:77.076716, availableSpots:31, occupiedSpots:19, totalSpots:50, pricePerHour:25, type:"open", amenities:[], rating:3.6, state:"Delhi", district:"Janakpuri" },
  { _id:'578', name:"Janakpuri Junction Parking", address:"Janakpuri, Delhi", lat:28.602053, lng:77.064505, availableSpots:30, occupiedSpots:20, totalSpots:50, pricePerHour:30, type:"basement", amenities:["24h"], rating:3.6, state:"Delhi", district:"Janakpuri" },
  { _id:'579', name:"Nehru Place Business District Parking", address:"Nehru Place, Delhi", lat:28.537478, lng:77.257428, availableSpots:15, occupiedSpots:5, totalSpots:20, pricePerHour:20, type:"covered", amenities:["ev", "24h"], rating:4.0, state:"Delhi", district:"Nehru Place" },
  { _id:'580', name:"Nehru Place Town Hall Parking", address:"Nehru Place, Delhi", lat:28.545099, lng:77.251464, availableSpots:2, occupiedSpots:28, totalSpots:30, pricePerHour:80, type:"open", amenities:[], rating:4.1, state:"Delhi", district:"Nehru Place" },
  { _id:'581', name:"Sector 17 Town Hall Parking", address:"Sector 17, Chandigarh", lat:30.734941, lng:76.783758, availableSpots:14, occupiedSpots:11, totalSpots:25, pricePerHour:15, type:"basement", amenities:["ev", "24h"], rating:3.9, state:"Chandigarh", district:"Sector 17" },
  { _id:'582', name:"Sector 17 Railway Station Parking", address:"Sector 17, Chandigarh", lat:30.738702, lng:76.77755, availableSpots:18, occupiedSpots:12, totalSpots:30, pricePerHour:15, type:"covered", amenities:["ev"], rating:3.7, state:"Chandigarh", district:"Sector 17" },
  { _id:'583', name:"Sector 17 Central Parking", address:"Sector 17, Chandigarh", lat:30.747959, lng:76.772368, availableSpots:25, occupiedSpots:5, totalSpots:30, pricePerHour:80, type:"open", amenities:["24h"], rating:4.1, state:"Chandigarh", district:"Sector 17" },
  { _id:'584', name:"Sector 22 Civic Center Parking", address:"Sector 22, Chandigarh", lat:30.743258, lng:76.768601, availableSpots:12, occupiedSpots:8, totalSpots:20, pricePerHour:80, type:"basement", amenities:[], rating:4.1, state:"Chandigarh", district:"Sector 22" },
  { _id:'585', name:"Sector 22 City Parking", address:"Sector 22, Chandigarh", lat:30.734421, lng:76.794176, availableSpots:36, occupiedSpots:4, totalSpots:40, pricePerHour:30, type:"covered", amenities:["24h"], rating:4.2, state:"Chandigarh", district:"Sector 22" },
  { _id:'586', name:"Sector 22 Municipal Parking", address:"Sector 22, Chandigarh", lat:30.716158, lng:76.795611, availableSpots:16, occupiedSpots:4, totalSpots:20, pricePerHour:100, type:"open", amenities:["ev", "24h"], rating:4.9, state:"Chandigarh", district:"Sector 22" },
  { _id:'587', name:"Industrial Area Smart Parking Hub", address:"Industrial Area, Chandigarh", lat:30.716018, lng:76.809401, availableSpots:9, occupiedSpots:41, totalSpots:50, pricePerHour:20, type:"basement", amenities:[], rating:4.9, state:"Chandigarh", district:"Industrial Area" },
  { _id:'588', name:"Industrial Area Commercial Parking", address:"Industrial Area, Chandigarh", lat:30.701962, lng:76.820262, availableSpots:6, occupiedSpots:19, totalSpots:25, pricePerHour:30, type:"covered", amenities:["ev", "24h"], rating:3.7, state:"Chandigarh", district:"Industrial Area" },
  { _id:'589', name:"Industrial Area Market Parking", address:"Industrial Area, Chandigarh", lat:30.700935, lng:76.821831, availableSpots:12, occupiedSpots:28, totalSpots:40, pricePerHour:25, type:"open", amenities:["ev"], rating:4.8, state:"Chandigarh", district:"Industrial Area" },
  { _id:'590', name:"Sector 17 Station Parking", address:"Sector 17, Chandigarh", lat:30.730415, lng:76.804932, availableSpots:2, occupiedSpots:18, totalSpots:20, pricePerHour:50, type:"basement", amenities:["24h"], rating:4.3, state:"Chandigarh", district:"Sector 17" },
  { _id:'591', name:"Sector 17 Metro Parking", address:"Sector 17, Chandigarh", lat:30.742182, lng:76.802765, availableSpots:29, occupiedSpots:21, totalSpots:50, pricePerHour:15, type:"covered", amenities:[], rating:4.7, state:"Chandigarh", district:"Sector 17" },
  { _id:'592', name:"Sector 17 Business District Parking", address:"Sector 17, Chandigarh", lat:30.745022, lng:76.789402, availableSpots:7, occupiedSpots:33, totalSpots:40, pricePerHour:50, type:"open", amenities:["24h"], rating:3.7, state:"Chandigarh", district:"Sector 17" },
  { _id:'593', name:"Sector 22 Mall Parking", address:"Sector 22, Chandigarh", lat:30.735664, lng:76.782807, availableSpots:3, occupiedSpots:17, totalSpots:20, pricePerHour:100, type:"basement", amenities:["ev", "24h"], rating:4.7, state:"Chandigarh", district:"Sector 22" },
  { _id:'594', name:"Sector 22 Junction Parking", address:"Sector 22, Chandigarh", lat:30.74443, lng:76.794199, availableSpots:28, occupiedSpots:2, totalSpots:30, pricePerHour:50, type:"covered", amenities:[], rating:3.9, state:"Chandigarh", district:"Sector 22" },
  { _id:'595', name:"Sector 22 Bus Stand Parking", address:"Sector 22, Chandigarh", lat:30.739192, lng:76.782381, availableSpots:2, occupiedSpots:38, totalSpots:40, pricePerHour:25, type:"open", amenities:["ev", "24h"], rating:3.9, state:"Chandigarh", district:"Sector 22" },
  { _id:'596', name:"Industrial Area Town Hall Parking", address:"Industrial Area, Chandigarh", lat:30.689754, lng:76.806646, availableSpots:2, occupiedSpots:38, totalSpots:40, pricePerHour:50, type:"basement", amenities:["ev"], rating:4.8, state:"Chandigarh", district:"Industrial Area" },
  { _id:'597', name:"Industrial Area Railway Station Parking", address:"Industrial Area, Chandigarh", lat:30.69726, lng:76.791803, availableSpots:17, occupiedSpots:23, totalSpots:40, pricePerHour:40, type:"covered", amenities:["24h"], rating:3.5, state:"Chandigarh", district:"Industrial Area" },
  { _id:'598', name:"Industrial Area Central Parking", address:"Industrial Area, Chandigarh", lat:30.716695, lng:76.794422, availableSpots:26, occupiedSpots:4, totalSpots:30, pricePerHour:60, type:"open", amenities:[], rating:4.8, state:"Chandigarh", district:"Industrial Area" },
  { _id:'599', name:"Sector 17 Civic Center Parking", address:"Sector 17, Chandigarh", lat:30.747494, lng:76.8074, availableSpots:4, occupiedSpots:21, totalSpots:25, pricePerHour:35, type:"basement", amenities:["24h"], rating:5.0, state:"Chandigarh", district:"Sector 17" },
  { _id:'600', name:"Sector 17 City Parking", address:"Sector 17, Chandigarh", lat:30.737824, lng:76.801533, availableSpots:23, occupiedSpots:7, totalSpots:30, pricePerHour:50, type:"covered", amenities:["ev", "24h"], rating:4.4, state:"Chandigarh", district:"Sector 17" },
  { _id:'601', name:"Puducherry City City Parking", address:"Puducherry City, Puducherry", lat:11.925171, lng:79.805969, availableSpots:31, occupiedSpots:9, totalSpots:40, pricePerHour:80, type:"open", amenities:[], rating:4.8, state:"Puducherry", district:"Puducherry City" },
  { _id:'602', name:"Puducherry City Municipal Parking", address:"Puducherry City, Puducherry", lat:11.954441, lng:79.808911, availableSpots:2, occupiedSpots:23, totalSpots:25, pricePerHour:35, type:"basement", amenities:["ev", "24h"], rating:4.6, state:"Puducherry", district:"Puducherry City" },
  { _id:'603', name:"Puducherry City Station Parking", address:"Puducherry City, Puducherry", lat:11.937735, lng:79.819521, availableSpots:36, occupiedSpots:14, totalSpots:50, pricePerHour:15, type:"covered", amenities:["ev"], rating:3.8, state:"Puducherry", district:"Puducherry City" },
  { _id:'604', name:"Oulgaret Commercial Parking", address:"Oulgaret, Puducherry", lat:11.993307, lng:79.819429, availableSpots:7, occupiedSpots:13, totalSpots:20, pricePerHour:15, type:"open", amenities:["24h"], rating:4.2, state:"Puducherry", district:"Oulgaret" },
  { _id:'605', name:"Oulgaret Market Parking", address:"Oulgaret, Puducherry", lat:11.995021, lng:79.839585, availableSpots:11, occupiedSpots:19, totalSpots:30, pricePerHour:60, type:"basement", amenities:[], rating:4.3, state:"Puducherry", district:"Oulgaret" },
  { _id:'606', name:"Oulgaret Mall Parking", address:"Oulgaret, Puducherry", lat:11.983716, lng:79.816355, availableSpots:7, occupiedSpots:13, totalSpots:20, pricePerHour:40, type:"covered", amenities:["24h"], rating:4.2, state:"Puducherry", district:"Oulgaret" },
  { _id:'607', name:"Karaikal Metro Parking", address:"Karaikal, Puducherry", lat:10.923244, lng:79.856421, availableSpots:37, occupiedSpots:3, totalSpots:40, pricePerHour:80, type:"open", amenities:["ev", "24h"], rating:4.0, state:"Puducherry", district:"Karaikal" },
  { _id:'608', name:"Karaikal Business District Parking", address:"Karaikal, Puducherry", lat:10.911941, lng:79.85378, availableSpots:9, occupiedSpots:11, totalSpots:20, pricePerHour:15, type:"basement", amenities:[], rating:4.1, state:"Puducherry", district:"Karaikal" },
  { _id:'609', name:"Karaikal Town Hall Parking", address:"Karaikal, Puducherry", lat:10.911916, lng:79.84089, availableSpots:7, occupiedSpots:18, totalSpots:25, pricePerHour:30, type:"covered", amenities:["ev", "24h"], rating:4.5, state:"Puducherry", district:"Karaikal" },
  { _id:'610', name:"Puducherry City Junction Parking", address:"Puducherry City, Puducherry", lat:11.932363, lng:79.80468, availableSpots:0, occupiedSpots:20, totalSpots:20, pricePerHour:60, type:"open", amenities:["ev"], rating:4.9, state:"Puducherry", district:"Puducherry City" },
  { _id:'611', name:"Puducherry City Bus Stand Parking", address:"Puducherry City, Puducherry", lat:11.947495, lng:79.812346, availableSpots:7, occupiedSpots:13, totalSpots:20, pricePerHour:35, type:"basement", amenities:["24h"], rating:4.4, state:"Puducherry", district:"Puducherry City" },
  { _id:'612', name:"Puducherry City Civic Center Parking", address:"Puducherry City, Puducherry", lat:11.95932, lng:79.81681, availableSpots:13, occupiedSpots:17, totalSpots:30, pricePerHour:50, type:"covered", amenities:[], rating:4.8, state:"Puducherry", district:"Puducherry City" },
  { _id:'613', name:"Oulgaret Railway Station Parking", address:"Oulgaret, Puducherry", lat:11.97666, lng:79.820128, availableSpots:21, occupiedSpots:9, totalSpots:30, pricePerHour:80, type:"open", amenities:["24h"], rating:4.7, state:"Puducherry", district:"Oulgaret" },
  { _id:'614', name:"Oulgaret Central Parking", address:"Oulgaret, Puducherry", lat:11.974186, lng:79.815492, availableSpots:42, occupiedSpots:8, totalSpots:50, pricePerHour:40, type:"basement", amenities:["ev", "24h"], rating:4.3, state:"Puducherry", district:"Oulgaret" },
  { _id:'615', name:"Oulgaret Smart Parking Hub", address:"Oulgaret, Puducherry", lat:11.982051, lng:79.822707, availableSpots:15, occupiedSpots:5, totalSpots:20, pricePerHour:20, type:"covered", amenities:[], rating:4.0, state:"Puducherry", district:"Oulgaret" },
  { _id:'616', name:"Karaikal City Parking", address:"Karaikal, Puducherry", lat:10.916459, lng:79.831005, availableSpots:8, occupiedSpots:22, totalSpots:30, pricePerHour:35, type:"open", amenities:["ev", "24h"], rating:3.8, state:"Puducherry", district:"Karaikal" },
  { _id:'617', name:"Karaikal Municipal Parking", address:"Karaikal, Puducherry", lat:10.926092, lng:79.827612, availableSpots:19, occupiedSpots:1, totalSpots:20, pricePerHour:50, type:"basement", amenities:["ev"], rating:4.5, state:"Puducherry", district:"Karaikal" },
  { _id:'618', name:"Karaikal Station Parking", address:"Karaikal, Puducherry", lat:10.93263, lng:79.846851, availableSpots:18, occupiedSpots:22, totalSpots:40, pricePerHour:35, type:"covered", amenities:["24h"], rating:4.9, state:"Puducherry", district:"Karaikal" },
  { _id:'619', name:"Puducherry City Commercial Parking", address:"Puducherry City, Puducherry", lat:11.937784, lng:79.817769, availableSpots:45, occupiedSpots:5, totalSpots:50, pricePerHour:100, type:"open", amenities:[], rating:4.7, state:"Puducherry", district:"Puducherry City" },
  { _id:'620', name:"Puducherry City Market Parking", address:"Puducherry City, Puducherry", lat:11.935327, lng:79.816835, availableSpots:40, occupiedSpots:10, totalSpots:50, pricePerHour:60, type:"basement", amenities:["24h"], rating:4.9, state:"Puducherry", district:"Puducherry City" },
  { _id:'621', name:"Srinagar Market Parking", address:"Srinagar, Jammu and Kashmir", lat:34.090575, lng:74.797593, availableSpots:21, occupiedSpots:4, totalSpots:25, pricePerHour:80, type:"covered", amenities:["ev", "24h"], rating:3.8, state:"Jammu and Kashmir", district:"Srinagar" },
  { _id:'622', name:"Srinagar Mall Parking", address:"Srinagar, Jammu and Kashmir", lat:34.067604, lng:74.782418, availableSpots:23, occupiedSpots:7, totalSpots:30, pricePerHour:80, type:"open", amenities:[], rating:4.6, state:"Jammu and Kashmir", district:"Srinagar" },
  { _id:'623', name:"Srinagar Junction Parking", address:"Srinagar, Jammu and Kashmir", lat:34.071023, lng:74.804488, availableSpots:20, occupiedSpots:10, totalSpots:30, pricePerHour:20, type:"basement", amenities:["ev", "24h"], rating:3.8, state:"Jammu and Kashmir", district:"Srinagar" },
  { _id:'624', name:"Jammu Business District Parking", address:"Jammu, Jammu and Kashmir", lat:32.715533, lng:74.871857, availableSpots:21, occupiedSpots:19, totalSpots:40, pricePerHour:40, type:"covered", amenities:["ev"], rating:3.9, state:"Jammu and Kashmir", district:"Jammu" },
  { _id:'625', name:"Jammu Town Hall Parking", address:"Jammu, Jammu and Kashmir", lat:32.718362, lng:74.871049, availableSpots:3, occupiedSpots:37, totalSpots:40, pricePerHour:100, type:"open", amenities:["24h"], rating:4.4, state:"Jammu and Kashmir", district:"Jammu" },
  { _id:'626', name:"Jammu Railway Station Parking", address:"Jammu, Jammu and Kashmir", lat:32.731426, lng:74.855889, availableSpots:16, occupiedSpots:9, totalSpots:25, pricePerHour:20, type:"basement", amenities:[], rating:4.8, state:"Jammu and Kashmir", district:"Jammu" },
  { _id:'627', name:"Anantnag Bus Stand Parking", address:"Anantnag, Jammu and Kashmir", lat:33.726367, lng:75.140634, availableSpots:4, occupiedSpots:16, totalSpots:20, pricePerHour:25, type:"covered", amenities:["24h"], rating:5.0, state:"Jammu and Kashmir", district:"Anantnag" },
  { _id:'628', name:"Anantnag Civic Center Parking", address:"Anantnag, Jammu and Kashmir", lat:33.724807, lng:75.168188, availableSpots:9, occupiedSpots:31, totalSpots:40, pricePerHour:40, type:"open", amenities:["ev", "24h"], rating:4.8, state:"Jammu and Kashmir", district:"Anantnag" },
  { _id:'629', name:"Anantnag City Parking", address:"Anantnag, Jammu and Kashmir", lat:33.718314, lng:75.131932, availableSpots:20, occupiedSpots:10, totalSpots:30, pricePerHour:25, type:"basement", amenities:[], rating:4.0, state:"Jammu and Kashmir", district:"Anantnag" },
  { _id:'630', name:"Baramulla Central Parking", address:"Baramulla, Jammu and Kashmir", lat:34.179821, lng:74.341082, availableSpots:24, occupiedSpots:1, totalSpots:25, pricePerHour:25, type:"covered", amenities:["ev", "24h"], rating:4.4, state:"Jammu and Kashmir", district:"Baramulla" },
  { _id:'631', name:"Baramulla Smart Parking Hub", address:"Baramulla, Jammu and Kashmir", lat:34.183837, lng:74.354408, availableSpots:4, occupiedSpots:16, totalSpots:20, pricePerHour:100, type:"open", amenities:["ev"], rating:4.2, state:"Jammu and Kashmir", district:"Baramulla" },
  { _id:'632', name:"Baramulla Commercial Parking", address:"Baramulla, Jammu and Kashmir", lat:34.194676, lng:74.340161, availableSpots:24, occupiedSpots:16, totalSpots:40, pricePerHour:15, type:"basement", amenities:["24h"], rating:3.6, state:"Jammu and Kashmir", district:"Baramulla" },
  { _id:'633', name:"Udhampur Municipal Parking", address:"Udhampur, Jammu and Kashmir", lat:32.903977, lng:75.136224, availableSpots:10, occupiedSpots:10, totalSpots:20, pricePerHour:80, type:"covered", amenities:[], rating:3.8, state:"Jammu and Kashmir", district:"Udhampur" },
  { _id:'634', name:"Udhampur Station Parking", address:"Udhampur, Jammu and Kashmir", lat:32.92307, lng:75.146367, availableSpots:7, occupiedSpots:18, totalSpots:25, pricePerHour:40, type:"open", amenities:["24h"], rating:4.0, state:"Jammu and Kashmir", district:"Udhampur" },
  { _id:'635', name:"Udhampur Metro Parking", address:"Udhampur, Jammu and Kashmir", lat:32.900108, lng:75.141433, availableSpots:5, occupiedSpots:25, totalSpots:30, pricePerHour:20, type:"basement", amenities:["ev", "24h"], rating:4.7, state:"Jammu and Kashmir", district:"Udhampur" },
  { _id:'636', name:"Srinagar Market Parking", address:"Srinagar, Jammu and Kashmir", lat:34.075628, lng:74.788933, availableSpots:38, occupiedSpots:12, totalSpots:50, pricePerHour:80, type:"covered", amenities:[], rating:4.0, state:"Jammu and Kashmir", district:"Srinagar" },
  { _id:'637', name:"Srinagar Mall Parking", address:"Srinagar, Jammu and Kashmir", lat:34.099219, lng:74.817119, availableSpots:28, occupiedSpots:2, totalSpots:30, pricePerHour:60, type:"open", amenities:["ev", "24h"], rating:4.0, state:"Jammu and Kashmir", district:"Srinagar" },
  { _id:'638', name:"Srinagar Junction Parking", address:"Srinagar, Jammu and Kashmir", lat:34.071237, lng:74.815223, availableSpots:1, occupiedSpots:39, totalSpots:40, pricePerHour:30, type:"basement", amenities:["ev"], rating:3.8, state:"Jammu and Kashmir", district:"Srinagar" },
  { _id:'639', name:"Jammu Business District Parking", address:"Jammu, Jammu and Kashmir", lat:32.745995, lng:74.845448, availableSpots:18, occupiedSpots:2, totalSpots:20, pricePerHour:80, type:"covered", amenities:["24h"], rating:3.8, state:"Jammu and Kashmir", district:"Jammu" },
  { _id:'640', name:"Jammu Town Hall Parking", address:"Jammu, Jammu and Kashmir", lat:32.721264, lng:74.863022, availableSpots:12, occupiedSpots:8, totalSpots:20, pricePerHour:35, type:"open", amenities:[], rating:4.7, state:"Jammu and Kashmir", district:"Jammu" },
  { _id:'641', name:"Leh Town Hall Parking", address:"Leh, Ladakh", lat:34.157525, lng:77.580757, availableSpots:3, occupiedSpots:17, totalSpots:20, pricePerHour:15, type:"basement", amenities:["24h"], rating:3.6, state:"Ladakh", district:"Leh" },
  { _id:'642', name:"Leh Railway Station Parking", address:"Leh, Ladakh", lat:34.137232, lng:77.574773, availableSpots:17, occupiedSpots:3, totalSpots:20, pricePerHour:35, type:"covered", amenities:["ev", "24h"], rating:4.2, state:"Ladakh", district:"Leh" },
  { _id:'643', name:"Leh Central Parking", address:"Leh, Ladakh", lat:34.138725, lng:77.584808, availableSpots:9, occupiedSpots:11, totalSpots:20, pricePerHour:50, type:"open", amenities:[], rating:4.5, state:"Ladakh", district:"Leh" },
  { _id:'644', name:"Kargil Civic Center Parking", address:"Kargil, Ladakh", lat:34.560399, lng:76.125699, availableSpots:44, occupiedSpots:6, totalSpots:50, pricePerHour:25, type:"basement", amenities:["ev", "24h"], rating:4.1, state:"Ladakh", district:"Kargil" },
  { _id:'645', name:"Kargil City Parking", address:"Kargil, Ladakh", lat:34.569845, lng:76.135363, availableSpots:7, occupiedSpots:43, totalSpots:50, pricePerHour:35, type:"covered", amenities:["ev"], rating:3.7, state:"Ladakh", district:"Kargil" },
  { _id:'646', name:"Kargil Municipal Parking", address:"Kargil, Ladakh", lat:34.538151, lng:76.122846, availableSpots:24, occupiedSpots:1, totalSpots:25, pricePerHour:35, type:"open", amenities:["24h"], rating:4.7, state:"Ladakh", district:"Kargil" },
  { _id:'647', name:"Leh Smart Parking Hub", address:"Leh, Ladakh", lat:34.171525, lng:77.571317, availableSpots:18, occupiedSpots:22, totalSpots:40, pricePerHour:25, type:"basement", amenities:[], rating:3.6, state:"Ladakh", district:"Leh" },
  { _id:'648', name:"Leh Commercial Parking", address:"Leh, Ladakh", lat:34.152454, lng:77.565308, availableSpots:21, occupiedSpots:19, totalSpots:40, pricePerHour:30, type:"covered", amenities:["24h"], rating:3.5, state:"Ladakh", district:"Leh" },
  { _id:'649', name:"Leh Market Parking", address:"Leh, Ladakh", lat:34.159465, lng:77.593275, availableSpots:42, occupiedSpots:8, totalSpots:50, pricePerHour:60, type:"open", amenities:["ev", "24h"], rating:3.7, state:"Ladakh", district:"Leh" },
  { _id:'650', name:"Kargil Station Parking", address:"Kargil, Ladakh", lat:34.537503, lng:76.135368, availableSpots:8, occupiedSpots:12, totalSpots:20, pricePerHour:30, type:"basement", amenities:[], rating:4.2, state:"Ladakh", district:"Kargil" },
  { _id:'651', name:"Kargil Metro Parking", address:"Kargil, Ladakh", lat:34.572992, lng:76.125465, availableSpots:3, occupiedSpots:17, totalSpots:20, pricePerHour:25, type:"covered", amenities:["ev", "24h"], rating:4.8, state:"Ladakh", district:"Kargil" },
  { _id:'652', name:"Kargil Business District Parking", address:"Kargil, Ladakh", lat:34.56799, lng:76.129309, availableSpots:13, occupiedSpots:17, totalSpots:30, pricePerHour:20, type:"open", amenities:["ev"], rating:3.6, state:"Ladakh", district:"Kargil" },
  { _id:'653', name:"Leh Mall Parking", address:"Leh, Ladakh", lat:34.162928, lng:77.558836, availableSpots:21, occupiedSpots:4, totalSpots:25, pricePerHour:25, type:"basement", amenities:["24h"], rating:4.0, state:"Ladakh", district:"Leh" },
  { _id:'654', name:"Leh Junction Parking", address:"Leh, Ladakh", lat:34.168381, lng:77.595204, availableSpots:28, occupiedSpots:2, totalSpots:30, pricePerHour:20, type:"covered", amenities:[], rating:4.1, state:"Ladakh", district:"Leh" },
  { _id:'655', name:"Leh Bus Stand Parking", address:"Leh, Ladakh", lat:34.146309, lng:77.561553, availableSpots:29, occupiedSpots:11, totalSpots:40, pricePerHour:35, type:"open", amenities:["24h"], rating:4.8, state:"Ladakh", district:"Leh" },
  { _id:'656', name:"Kargil Town Hall Parking", address:"Kargil, Ladakh", lat:34.561496, lng:76.13403, availableSpots:10, occupiedSpots:30, totalSpots:40, pricePerHour:20, type:"basement", amenities:["ev", "24h"], rating:3.7, state:"Ladakh", district:"Kargil" },
  { _id:'657', name:"Kargil Railway Station Parking", address:"Kargil, Ladakh", lat:34.562956, lng:76.154163, availableSpots:3, occupiedSpots:22, totalSpots:25, pricePerHour:50, type:"covered", amenities:[], rating:4.9, state:"Ladakh", district:"Kargil" },
  { _id:'658', name:"Kargil Central Parking", address:"Kargil, Ladakh", lat:34.553207, lng:76.137658, availableSpots:11, occupiedSpots:29, totalSpots:40, pricePerHour:100, type:"open", amenities:["ev", "24h"], rating:4.1, state:"Ladakh", district:"Kargil" },
  { _id:'659', name:"Leh Civic Center Parking", address:"Leh, Ladakh", lat:34.146944, lng:77.558153, availableSpots:15, occupiedSpots:10, totalSpots:25, pricePerHour:60, type:"basement", amenities:["ev"], rating:3.7, state:"Ladakh", district:"Leh" },
  { _id:'660', name:"Leh City Parking", address:"Leh, Ladakh", lat:34.149051, lng:77.558839, availableSpots:20, occupiedSpots:10, totalSpots:30, pricePerHour:40, type:"covered", amenities:["24h"], rating:3.5, state:"Ladakh", district:"Leh" },
  { _id:'661', name:"Port Blair City Parking", address:"Port Blair, Andaman and Nicobar", lat:11.638133, lng:92.727493, availableSpots:46, occupiedSpots:4, totalSpots:50, pricePerHour:100, type:"open", amenities:[], rating:3.8, state:"Andaman and Nicobar", district:"Port Blair" },
  { _id:'662', name:"Port Blair Municipal Parking", address:"Port Blair, Andaman and Nicobar", lat:11.64163, lng:92.741426, availableSpots:33, occupiedSpots:17, totalSpots:50, pricePerHour:100, type:"basement", amenities:["24h"], rating:3.6, state:"Andaman and Nicobar", district:"Port Blair" },
  { _id:'663', name:"Port Blair Station Parking", address:"Port Blair, Andaman and Nicobar", lat:11.629869, lng:92.716443, availableSpots:21, occupiedSpots:9, totalSpots:30, pricePerHour:50, type:"covered", amenities:["ev", "24h"], rating:3.7, state:"Andaman and Nicobar", district:"Port Blair" },
  { _id:'664', name:"Diglipur Commercial Parking", address:"Diglipur, Andaman and Nicobar", lat:13.277858, lng:92.984082, availableSpots:3, occupiedSpots:47, totalSpots:50, pricePerHour:15, type:"open", amenities:[], rating:4.5, state:"Andaman and Nicobar", district:"Diglipur" },
  { _id:'665', name:"Diglipur Market Parking", address:"Diglipur, Andaman and Nicobar", lat:13.251077, lng:92.982354, availableSpots:10, occupiedSpots:30, totalSpots:40, pricePerHour:20, type:"basement", amenities:["ev", "24h"], rating:4.6, state:"Andaman and Nicobar", district:"Diglipur" },
  { _id:'666', name:"Diglipur Mall Parking", address:"Diglipur, Andaman and Nicobar", lat:13.257625, lng:92.961636, availableSpots:1, occupiedSpots:29, totalSpots:30, pricePerHour:80, type:"covered", amenities:["ev"], rating:3.8, state:"Andaman and Nicobar", district:"Diglipur" },
  { _id:'667', name:"Port Blair Metro Parking", address:"Port Blair, Andaman and Nicobar", lat:11.629133, lng:92.722631, availableSpots:2, occupiedSpots:23, totalSpots:25, pricePerHour:60, type:"open", amenities:["24h"], rating:4.2, state:"Andaman and Nicobar", district:"Port Blair" },
  { _id:'668', name:"Port Blair Business District Parking", address:"Port Blair, Andaman and Nicobar", lat:11.626321, lng:92.710021, availableSpots:28, occupiedSpots:12, totalSpots:40, pricePerHour:40, type:"basement", amenities:[], rating:3.7, state:"Andaman and Nicobar", district:"Port Blair" },
  { _id:'669', name:"Port Blair Town Hall Parking", address:"Port Blair, Andaman and Nicobar", lat:11.623295, lng:92.732635, availableSpots:12, occupiedSpots:8, totalSpots:20, pricePerHour:50, type:"covered", amenities:["24h"], rating:3.6, state:"Andaman and Nicobar", district:"Port Blair" },
  { _id:'670', name:"Diglipur Junction Parking", address:"Diglipur, Andaman and Nicobar", lat:13.266764, lng:92.981436, availableSpots:39, occupiedSpots:11, totalSpots:50, pricePerHour:35, type:"open", amenities:["ev", "24h"], rating:4.8, state:"Andaman and Nicobar", district:"Diglipur" },
  { _id:'671', name:"Diglipur Bus Stand Parking", address:"Diglipur, Andaman and Nicobar", lat:13.267293, lng:92.974584, availableSpots:21, occupiedSpots:19, totalSpots:40, pricePerHour:40, type:"basement", amenities:[], rating:4.7, state:"Andaman and Nicobar", district:"Diglipur" },
  { _id:'672', name:"Diglipur Civic Center Parking", address:"Diglipur, Andaman and Nicobar", lat:13.277464, lng:92.982173, availableSpots:17, occupiedSpots:13, totalSpots:30, pricePerHour:100, type:"covered", amenities:["ev", "24h"], rating:4.4, state:"Andaman and Nicobar", district:"Diglipur" },
  { _id:'673', name:"Port Blair Railway Station Parking", address:"Port Blair, Andaman and Nicobar", lat:11.632066, lng:92.721032, availableSpots:7, occupiedSpots:33, totalSpots:40, pricePerHour:20, type:"open", amenities:["ev"], rating:4.6, state:"Andaman and Nicobar", district:"Port Blair" },
  { _id:'674', name:"Port Blair Central Parking", address:"Port Blair, Andaman and Nicobar", lat:11.61227, lng:92.720154, availableSpots:17, occupiedSpots:13, totalSpots:30, pricePerHour:80, type:"basement", amenities:["24h"], rating:4.1, state:"Andaman and Nicobar", district:"Port Blair" },
  { _id:'675', name:"Port Blair Smart Parking Hub", address:"Port Blair, Andaman and Nicobar", lat:11.607653, lng:92.742375, availableSpots:8, occupiedSpots:32, totalSpots:40, pricePerHour:50, type:"covered", amenities:[], rating:3.7, state:"Andaman and Nicobar", district:"Port Blair" },
  { _id:'676', name:"Diglipur City Parking", address:"Diglipur, Andaman and Nicobar", lat:13.269234, lng:92.955902, availableSpots:13, occupiedSpots:27, totalSpots:40, pricePerHour:60, type:"open", amenities:["24h"], rating:4.7, state:"Andaman and Nicobar", district:"Diglipur" },
  { _id:'677', name:"Diglipur Municipal Parking", address:"Diglipur, Andaman and Nicobar", lat:13.252423, lng:92.961917, availableSpots:2, occupiedSpots:38, totalSpots:40, pricePerHour:100, type:"basement", amenities:["ev", "24h"], rating:3.7, state:"Andaman and Nicobar", district:"Diglipur" },
  { _id:'678', name:"Diglipur Station Parking", address:"Diglipur, Andaman and Nicobar", lat:13.28047, lng:92.966696, availableSpots:32, occupiedSpots:18, totalSpots:50, pricePerHour:25, type:"covered", amenities:[], rating:4.9, state:"Andaman and Nicobar", district:"Diglipur" },
  { _id:'679', name:"Port Blair Commercial Parking", address:"Port Blair, Andaman and Nicobar", lat:11.603574, lng:92.735949, availableSpots:27, occupiedSpots:23, totalSpots:50, pricePerHour:100, type:"open", amenities:["ev", "24h"], rating:4.2, state:"Andaman and Nicobar", district:"Port Blair" },
  { _id:'680', name:"Port Blair Market Parking", address:"Port Blair, Andaman and Nicobar", lat:11.623733, lng:92.743346, availableSpots:22, occupiedSpots:3, totalSpots:25, pricePerHour:100, type:"basement", amenities:["ev"], rating:3.8, state:"Andaman and Nicobar", district:"Port Blair" },
  { _id:'681', name:"Kavaratti Market Parking", address:"Kavaratti, Lakshadweep", lat:10.57521, lng:72.621042, availableSpots:38, occupiedSpots:12, totalSpots:50, pricePerHour:40, type:"covered", amenities:["24h"], rating:4.3, state:"Lakshadweep", district:"Kavaratti" },
  { _id:'682', name:"Kavaratti Mall Parking", address:"Kavaratti, Lakshadweep", lat:10.557987, lng:72.65608, availableSpots:8, occupiedSpots:17, totalSpots:25, pricePerHour:50, type:"open", amenities:[], rating:4.9, state:"Lakshadweep", district:"Kavaratti" },
  { _id:'683', name:"Kavaratti Junction Parking", address:"Kavaratti, Lakshadweep", lat:10.58142, lng:72.635014, availableSpots:4, occupiedSpots:21, totalSpots:25, pricePerHour:50, type:"basement", amenities:["24h"], rating:4.4, state:"Lakshadweep", district:"Kavaratti" },
  { _id:'684', name:"Agatti Business District Parking", address:"Agatti, Lakshadweep", lat:10.838957, lng:72.186392, availableSpots:20, occupiedSpots:30, totalSpots:50, pricePerHour:80, type:"covered", amenities:["ev", "24h"], rating:4.4, state:"Lakshadweep", district:"Agatti" },
  { _id:'685', name:"Agatti Town Hall Parking", address:"Agatti, Lakshadweep", lat:10.811536, lng:72.190867, availableSpots:21, occupiedSpots:9, totalSpots:30, pricePerHour:40, type:"open", amenities:[], rating:4.9, state:"Lakshadweep", district:"Agatti" },
  { _id:'686', name:"Agatti Railway Station Parking", address:"Agatti, Lakshadweep", lat:10.808807, lng:72.194316, availableSpots:16, occupiedSpots:9, totalSpots:25, pricePerHour:80, type:"basement", amenities:["ev", "24h"], rating:4.5, state:"Lakshadweep", district:"Agatti" },
  { _id:'687', name:"Kavaratti Bus Stand Parking", address:"Kavaratti, Lakshadweep", lat:10.555495, lng:72.621516, availableSpots:17, occupiedSpots:13, totalSpots:30, pricePerHour:60, type:"covered", amenities:["ev"], rating:4.4, state:"Lakshadweep", district:"Kavaratti" },
  { _id:'688', name:"Kavaratti Civic Center Parking", address:"Kavaratti, Lakshadweep", lat:10.580307, lng:72.645305, availableSpots:18, occupiedSpots:32, totalSpots:50, pricePerHour:50, type:"open", amenities:["24h"], rating:4.7, state:"Lakshadweep", district:"Kavaratti" },
  { _id:'689', name:"Kavaratti City Parking", address:"Kavaratti, Lakshadweep", lat:10.563509, lng:72.617911, availableSpots:1, occupiedSpots:24, totalSpots:25, pricePerHour:15, type:"basement", amenities:[], rating:3.8, state:"Lakshadweep", district:"Kavaratti" },
  { _id:'690', name:"Agatti Central Parking", address:"Agatti, Lakshadweep", lat:10.833507, lng:72.172337, availableSpots:21, occupiedSpots:9, totalSpots:30, pricePerHour:35, type:"covered", amenities:["24h"], rating:3.7, state:"Lakshadweep", district:"Agatti" },
  { _id:'691', name:"Agatti Smart Parking Hub", address:"Agatti, Lakshadweep", lat:10.805981, lng:72.197274, availableSpots:24, occupiedSpots:1, totalSpots:25, pricePerHour:80, type:"open", amenities:["ev", "24h"], rating:3.5, state:"Lakshadweep", district:"Agatti" },
  { _id:'692', name:"Agatti Commercial Parking", address:"Agatti, Lakshadweep", lat:10.836061, lng:72.169999, availableSpots:14, occupiedSpots:36, totalSpots:50, pricePerHour:80, type:"basement", amenities:[], rating:4.1, state:"Lakshadweep", district:"Agatti" },
  { _id:'693', name:"Kavaratti Municipal Parking", address:"Kavaratti, Lakshadweep", lat:10.563037, lng:72.648773, availableSpots:22, occupiedSpots:8, totalSpots:30, pricePerHour:15, type:"covered", amenities:["ev", "24h"], rating:4.9, state:"Lakshadweep", district:"Kavaratti" },
  { _id:'694', name:"Kavaratti Station Parking", address:"Kavaratti, Lakshadweep", lat:10.558102, lng:72.655168, availableSpots:30, occupiedSpots:0, totalSpots:30, pricePerHour:80, type:"open", amenities:["ev"], rating:3.6, state:"Lakshadweep", district:"Kavaratti" },
  { _id:'695', name:"Kavaratti Metro Parking", address:"Kavaratti, Lakshadweep", lat:10.572347, lng:72.625023, availableSpots:14, occupiedSpots:26, totalSpots:40, pricePerHour:40, type:"basement", amenities:["24h"], rating:4.6, state:"Lakshadweep", district:"Kavaratti" },
  { _id:'696', name:"Agatti Market Parking", address:"Agatti, Lakshadweep", lat:10.825365, lng:72.190035, availableSpots:9, occupiedSpots:16, totalSpots:25, pricePerHour:60, type:"covered", amenities:[], rating:3.8, state:"Lakshadweep", district:"Agatti" },
  { _id:'697', name:"Agatti Mall Parking", address:"Agatti, Lakshadweep", lat:10.830806, lng:72.173379, availableSpots:23, occupiedSpots:2, totalSpots:25, pricePerHour:80, type:"open", amenities:["24h"], rating:3.7, state:"Lakshadweep", district:"Agatti" },
  { _id:'698', name:"Agatti Junction Parking", address:"Agatti, Lakshadweep", lat:10.805125, lng:72.177064, availableSpots:4, occupiedSpots:26, totalSpots:30, pricePerHour:25, type:"basement", amenities:["ev", "24h"], rating:4.4, state:"Lakshadweep", district:"Agatti" },
  { _id:'699', name:"Kavaratti Business District Parking", address:"Kavaratti, Lakshadweep", lat:10.552801, lng:72.630123, availableSpots:1, occupiedSpots:24, totalSpots:25, pricePerHour:25, type:"covered", amenities:[], rating:4.9, state:"Lakshadweep", district:"Kavaratti" },
  { _id:'700', name:"Kavaratti Town Hall Parking", address:"Kavaratti, Lakshadweep", lat:10.566475, lng:72.647846, availableSpots:42, occupiedSpots:8, totalSpots:50, pricePerHour:35, type:"open", amenities:["ev", "24h"], rating:4.2, state:"Lakshadweep", district:"Kavaratti" },
  { _id:'701', name:"Silvassa Town Hall Parking", address:"Silvassa, Dadra and Nagar Haveli", lat:20.279507, lng:73.011223, availableSpots:16, occupiedSpots:14, totalSpots:30, pricePerHour:30, type:"basement", amenities:["ev"], rating:4.9, state:"Dadra and Nagar Haveli", district:"Silvassa" },
  { _id:'702', name:"Silvassa Railway Station Parking", address:"Silvassa, Dadra and Nagar Haveli", lat:20.277424, lng:73.02835, availableSpots:13, occupiedSpots:12, totalSpots:25, pricePerHour:80, type:"covered", amenities:["24h"], rating:4.3, state:"Dadra and Nagar Haveli", district:"Silvassa" },
  { _id:'703', name:"Silvassa Central Parking", address:"Silvassa, Dadra and Nagar Haveli", lat:20.260278, lng:73.005748, availableSpots:21, occupiedSpots:4, totalSpots:25, pricePerHour:40, type:"open", amenities:[], rating:4.0, state:"Dadra and Nagar Haveli", district:"Silvassa" },
  { _id:'704', name:"Naroli Civic Center Parking", address:"Naroli, Dadra and Nagar Haveli", lat:20.281943, lng:73.057012, availableSpots:33, occupiedSpots:17, totalSpots:50, pricePerHour:60, type:"basement", amenities:["24h"], rating:5.0, state:"Dadra and Nagar Haveli", district:"Naroli" },
  { _id:'705', name:"Naroli City Parking", address:"Naroli, Dadra and Nagar Haveli", lat:20.303148, lng:73.058245, availableSpots:3, occupiedSpots:17, totalSpots:20, pricePerHour:40, type:"covered", amenities:["ev", "24h"], rating:4.2, state:"Dadra and Nagar Haveli", district:"Naroli" },
  { _id:'706', name:"Naroli Municipal Parking", address:"Naroli, Dadra and Nagar Haveli", lat:20.30638, lng:73.043548, availableSpots:15, occupiedSpots:35, totalSpots:50, pricePerHour:15, type:"open", amenities:[], rating:4.5, state:"Dadra and Nagar Haveli", district:"Naroli" },
  { _id:'707', name:"Silvassa Smart Parking Hub", address:"Silvassa, Dadra and Nagar Haveli", lat:20.269437, lng:73.033537, availableSpots:12, occupiedSpots:8, totalSpots:20, pricePerHour:35, type:"basement", amenities:["ev", "24h"], rating:4.3, state:"Dadra and Nagar Haveli", district:"Silvassa" },
  { _id:'708', name:"Silvassa Commercial Parking", address:"Silvassa, Dadra and Nagar Haveli", lat:20.267913, lng:73.033353, availableSpots:16, occupiedSpots:14, totalSpots:30, pricePerHour:80, type:"covered", amenities:["ev"], rating:4.2, state:"Dadra and Nagar Haveli", district:"Silvassa" },
  { _id:'709', name:"Silvassa Market Parking", address:"Silvassa, Dadra and Nagar Haveli", lat:20.258354, lng:73.032831, availableSpots:10, occupiedSpots:15, totalSpots:25, pricePerHour:80, type:"open", amenities:["24h"], rating:3.6, state:"Dadra and Nagar Haveli", district:"Silvassa" },
  { _id:'710', name:"Naroli Station Parking", address:"Naroli, Dadra and Nagar Haveli", lat:20.274038, lng:73.057865, availableSpots:34, occupiedSpots:16, totalSpots:50, pricePerHour:15, type:"basement", amenities:[], rating:4.4, state:"Dadra and Nagar Haveli", district:"Naroli" },
  { _id:'711', name:"Naroli Metro Parking", address:"Naroli, Dadra and Nagar Haveli", lat:20.278631, lng:73.044181, availableSpots:21, occupiedSpots:4, totalSpots:25, pricePerHour:50, type:"covered", amenities:["24h"], rating:4.8, state:"Dadra and Nagar Haveli", district:"Naroli" },
  { _id:'712', name:"Naroli Business District Parking", address:"Naroli, Dadra and Nagar Haveli", lat:20.278423, lng:73.05215, availableSpots:4, occupiedSpots:36, totalSpots:40, pricePerHour:25, type:"open", amenities:["ev", "24h"], rating:3.5, state:"Dadra and Nagar Haveli", district:"Naroli" },
  { _id:'713', name:"Silvassa Mall Parking", address:"Silvassa, Dadra and Nagar Haveli", lat:20.285275, lng:72.998415, availableSpots:1, occupiedSpots:19, totalSpots:20, pricePerHour:25, type:"basement", amenities:[], rating:4.7, state:"Dadra and Nagar Haveli", district:"Silvassa" },
  { _id:'714', name:"Silvassa Junction Parking", address:"Silvassa, Dadra and Nagar Haveli", lat:20.278923, lng:73.019898, availableSpots:8, occupiedSpots:17, totalSpots:25, pricePerHour:50, type:"covered", amenities:["ev", "24h"], rating:4.1, state:"Dadra and Nagar Haveli", district:"Silvassa" },
  { _id:'715', name:"Silvassa Bus Stand Parking", address:"Silvassa, Dadra and Nagar Haveli", lat:20.281809, lng:73.014221, availableSpots:12, occupiedSpots:8, totalSpots:20, pricePerHour:20, type:"open", amenities:["ev"], rating:4.3, state:"Dadra and Nagar Haveli", district:"Silvassa" },
  { _id:'716', name:"Naroli Town Hall Parking", address:"Naroli, Dadra and Nagar Haveli", lat:20.295857, lng:73.043734, availableSpots:2, occupiedSpots:48, totalSpots:50, pricePerHour:20, type:"basement", amenities:["24h"], rating:4.0, state:"Dadra and Nagar Haveli", district:"Naroli" },
  { _id:'717', name:"Naroli Railway Station Parking", address:"Naroli, Dadra and Nagar Haveli", lat:20.290313, lng:73.030593, availableSpots:19, occupiedSpots:11, totalSpots:30, pricePerHour:20, type:"covered", amenities:[], rating:3.9, state:"Dadra and Nagar Haveli", district:"Naroli" },
  { _id:'718', name:"Naroli Central Parking", address:"Naroli, Dadra and Nagar Haveli", lat:20.307268, lng:73.034257, availableSpots:15, occupiedSpots:5, totalSpots:20, pricePerHour:25, type:"open", amenities:["24h"], rating:4.3, state:"Dadra and Nagar Haveli", district:"Naroli" },
  { _id:'719', name:"Silvassa Civic Center Parking", address:"Silvassa, Dadra and Nagar Haveli", lat:20.262055, lng:73.01254, availableSpots:18, occupiedSpots:32, totalSpots:50, pricePerHour:25, type:"basement", amenities:["ev", "24h"], rating:3.9, state:"Dadra and Nagar Haveli", district:"Silvassa" },
  { _id:'720', name:"Silvassa City Parking", address:"Silvassa, Dadra and Nagar Haveli", lat:20.292079, lng:73.035515, availableSpots:30, occupiedSpots:0, totalSpots:30, pricePerHour:15, type:"covered", amenities:[], rating:4.3, state:"Dadra and Nagar Haveli", district:"Silvassa" },
  { _id:'721', name:"Daman City Parking", address:"Daman, Daman and Diu", lat:20.399603, lng:72.817729, availableSpots:18, occupiedSpots:2, totalSpots:20, pricePerHour:100, type:"open", amenities:["ev", "24h"], rating:4.1, state:"Daman and Diu", district:"Daman" },
  { _id:'722', name:"Daman Municipal Parking", address:"Daman, Daman and Diu", lat:20.399301, lng:72.816205, availableSpots:23, occupiedSpots:2, totalSpots:25, pricePerHour:40, type:"basement", amenities:["ev"], rating:3.8, state:"Daman and Diu", district:"Daman" },
  { _id:'723', name:"Daman Station Parking", address:"Daman, Daman and Diu", lat:20.413625, lng:72.846858, availableSpots:5, occupiedSpots:20, totalSpots:25, pricePerHour:25, type:"covered", amenities:["24h"], rating:3.8, state:"Daman and Diu", district:"Daman" },
  { _id:'724', name:"Diu Commercial Parking", address:"Diu, Daman and Diu", lat:20.72779, lng:70.975173, availableSpots:21, occupiedSpots:4, totalSpots:25, pricePerHour:100, type:"open", amenities:[], rating:4.8, state:"Daman and Diu", district:"Diu" },
  { _id:'725', name:"Diu Market Parking", address:"Diu, Daman and Diu", lat:20.728456, lng:71.004695, availableSpots:29, occupiedSpots:21, totalSpots:50, pricePerHour:80, type:"basement", amenities:["24h"], rating:3.6, state:"Daman and Diu", district:"Diu" },
  { _id:'726', name:"Diu Mall Parking", address:"Diu, Daman and Diu", lat:20.721267, lng:70.977428, availableSpots:23, occupiedSpots:2, totalSpots:25, pricePerHour:100, type:"covered", amenities:["ev", "24h"], rating:4.2, state:"Daman and Diu", district:"Diu" },
  { _id:'727', name:"Daman Metro Parking", address:"Daman, Daman and Diu", lat:20.390634, lng:72.817929, availableSpots:3, occupiedSpots:22, totalSpots:25, pricePerHour:35, type:"open", amenities:[], rating:4.4, state:"Daman and Diu", district:"Daman" },
  { _id:'728', name:"Daman Business District Parking", address:"Daman, Daman and Diu", lat:20.413405, lng:72.825511, availableSpots:21, occupiedSpots:19, totalSpots:40, pricePerHour:100, type:"basement", amenities:["ev", "24h"], rating:4.5, state:"Daman and Diu", district:"Daman" },
  { _id:'729', name:"Daman Town Hall Parking", address:"Daman, Daman and Diu", lat:20.405138, lng:72.818896, availableSpots:23, occupiedSpots:27, totalSpots:50, pricePerHour:40, type:"covered", amenities:["ev"], rating:4.9, state:"Daman and Diu", district:"Daman" },
  { _id:'730', name:"Diu Junction Parking", address:"Diu, Daman and Diu", lat:20.701146, lng:70.979929, availableSpots:22, occupiedSpots:3, totalSpots:25, pricePerHour:50, type:"open", amenities:["24h"], rating:3.9, state:"Daman and Diu", district:"Diu" },
  { _id:'731', name:"Diu Bus Stand Parking", address:"Diu, Daman and Diu", lat:20.708779, lng:70.994583, availableSpots:28, occupiedSpots:2, totalSpots:30, pricePerHour:60, type:"basement", amenities:[], rating:4.2, state:"Daman and Diu", district:"Diu" },
  { _id:'732', name:"Diu Civic Center Parking", address:"Diu, Daman and Diu", lat:20.70875, lng:70.979619, availableSpots:6, occupiedSpots:44, totalSpots:50, pricePerHour:25, type:"covered", amenities:["24h"], rating:4.5, state:"Daman and Diu", district:"Diu" },
  { _id:'733', name:"Daman Railway Station Parking", address:"Daman, Daman and Diu", lat:20.380679, lng:72.824025, availableSpots:17, occupiedSpots:8, totalSpots:25, pricePerHour:30, type:"open", amenities:["ev", "24h"], rating:3.9, state:"Daman and Diu", district:"Daman" },
  { _id:'734', name:"Daman Central Parking", address:"Daman, Daman and Diu", lat:20.412853, lng:72.815858, availableSpots:0, occupiedSpots:20, totalSpots:20, pricePerHour:80, type:"basement", amenities:[], rating:4.4, state:"Daman and Diu", district:"Daman" },
  { _id:'735', name:"Daman Smart Parking Hub", address:"Daman, Daman and Diu", lat:20.409906, lng:72.835956, availableSpots:13, occupiedSpots:37, totalSpots:50, pricePerHour:15, type:"covered", amenities:["ev", "24h"], rating:4.3, state:"Daman and Diu", district:"Daman" },
  { _id:'736', name:"Diu City Parking", address:"Diu, Daman and Diu", lat:20.716139, lng:71.007349, availableSpots:9, occupiedSpots:31, totalSpots:40, pricePerHour:40, type:"open", amenities:["ev"], rating:4.1, state:"Daman and Diu", district:"Diu" },
  { _id:'737', name:"Diu Municipal Parking", address:"Diu, Daman and Diu", lat:20.730058, lng:70.990984, availableSpots:4, occupiedSpots:26, totalSpots:30, pricePerHour:60, type:"basement", amenities:["24h"], rating:4.3, state:"Daman and Diu", district:"Diu" },
  { _id:'738', name:"Diu Station Parking", address:"Diu, Daman and Diu", lat:20.698022, lng:70.981955, availableSpots:7, occupiedSpots:13, totalSpots:20, pricePerHour:100, type:"covered", amenities:[], rating:4.5, state:"Daman and Diu", district:"Diu" },
  { _id:'739', name:"Daman Commercial Parking", address:"Daman, Daman and Diu", lat:20.407688, lng:72.818415, availableSpots:5, occupiedSpots:20, totalSpots:25, pricePerHour:100, type:"open", amenities:["24h"], rating:4.9, state:"Daman and Diu", district:"Daman" },
  { _id:'740', name:"Daman Market Parking", address:"Daman, Daman and Diu", lat:20.403777, lng:72.851509, availableSpots:22, occupiedSpots:18, totalSpots:40, pricePerHour:15, type:"basement", amenities:["ev", "24h"], rating:3.8, state:"Daman and Diu", district:"Daman" },
]
// ── Helpers ───────────────────────────────────────────────────────────────────
const slotColor = (a) => a === 0 ? '#f54242' : a <= 4 ? '#f5a623' : '#14b371'
const slotBg    = (a) => a === 0 ? 'rgba(245,66,66,0.15)' : a <= 4 ? 'rgba(245,166,35,0.15)' : 'rgba(20,179,113,0.15)'
const slotLabel = (a) => a === 0 ? 'Full' : a <= 4 ? `${a} left` : `${a} free`

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371, toRad = (d) => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1), dLng = toRad(lng2 - lng1)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function Stars({ rating }) {
  return (
    <span style={{ display:'flex', alignItems:'center', gap:2 }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ color: i <= Math.round(rating) ? '#f5e642' : '#374151', fontSize:11 }}>★</span>
      ))}
      <span style={{ color:'#9ca3af', fontSize:11, marginLeft:2 }}>{rating}</span>
    </span>
  )
}

// ── Parking Pin ───────────────────────────────────────────────────────────────
function ParkingPin({ lot, selected, onClick }) {
  const color = slotColor(lot.availableSpots)
  const size  = selected ? 48 : 38
  return (
    <MapMarker longitude={lot.lng} latitude={lot.lat} offset={[0, -size / 2]} onClick={onClick}>
      <MarkerContent>
        <div style={{
          width: size, height: size,
          background: color,
          borderRadius: '50% 50% 50% 0',
          transform: 'rotate(-45deg)',
          border: `3px solid ${selected ? 'white' : 'rgba(255,255,255,0.75)'}`,
          boxShadow: selected
            ? `0 0 0 3px ${color}55, 0 4px 16px ${color}88`
            : '0 4px 12px rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s',
          cursor: 'pointer',
        }}>
          <span style={{ transform:'rotate(45deg)', fontSize: selected ? 14 : 12, fontWeight:800, color:'white' }}>P</span>
        </div>
      </MarkerContent>
    </MapMarker>
  )
}

// ── Popup Card ────────────────────────────────────────────────────────────────
function LotPopupCard({ lot, onClose, onBook }) {
  const { availableSpots: avail, occupiedSpots, totalSpots: total, pricePerHour } = lot
  const occupied = occupiedSpots ?? (total - avail)
  const fillPct  = ((total - avail) / total) * 100

  return (
    <div style={{ minWidth:270, fontFamily:'inherit' }}>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
        <div style={{ flex:1, paddingRight:8 }}>
          <p style={{ fontWeight:700, fontSize:15, margin:0, color:'white', lineHeight:1.3 }}>{lot.name}</p>
          <p style={{ fontSize:11, color:'#9ca3af', margin:'3px 0 0', display:'flex', alignItems:'center', gap:3 }}>
            <RiMapPin2Line style={{ color:'#14b371' }}/> {lot.address}
          </p>
        </div>
        <button onClick={onClose} style={{ background:'none', border:'none', color:'#6b7280', cursor:'pointer', fontSize:18, padding:0, lineHeight:1 }}>✕</button>
      </div>

      {/* Slot Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:6, marginBottom:10 }}>
        {[
          { label:'Available', value:avail,    color:slotColor(avail), bg:slotBg(avail) },
          { label:'Occupied',  value:occupied,  color:'#f54242',        bg:'rgba(245,66,66,0.12)' },
          { label:'Total',     value:total,     color:'#e0e0e0',        bg:'rgba(255,255,255,0.06)' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} style={{ background:bg, borderRadius:10, padding:'8px 4px', textAlign:'center', border:`1px solid ${color}33` }}>
            <p style={{ color, fontWeight:800, fontSize:18, margin:0, lineHeight:1 }}>{value}</p>
            <p style={{ color:'#9ca3af', fontSize:10, margin:'3px 0 0' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Fill bar */}
      <div style={{ marginBottom:10 }}>
        <div style={{ height:5, background:'rgba(255,255,255,0.08)', borderRadius:4, overflow:'hidden' }}>
          <div style={{ height:'100%', width:`${fillPct}%`, background:slotColor(avail), borderRadius:4, transition:'width 0.4s' }}/>
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', marginTop:3 }}>
          <span style={{ fontSize:10, color:'#6b7280' }}>{Math.round(fillPct)}% occupied</span>
          <span style={{ fontSize:11, color:'#14b371', fontWeight:700 }}>₹{pricePerHour}/hr</span>
        </div>
      </div>

      {/* Amenities + rating */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
        <Stars rating={lot.rating}/>
        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
          {lot.amenities.includes('ev')  && <span style={{ fontSize:10, padding:'2px 7px', borderRadius:6, background:'rgba(245,230,66,0.1)', color:'#f5e642' }}>⚡ EV</span>}
          {lot.amenities.includes('24h') && <span style={{ fontSize:10, padding:'2px 7px', borderRadius:6, background:'rgba(66,133,245,0.1)', color:'#90b4f5' }}>🌙 24/7</span>}
          <span style={{ fontSize:10, padding:'2px 7px', borderRadius:6, background:'rgba(255,255,255,0.07)', color:'#9ca3af', textTransform:'capitalize' }}>{lot.type}</span>
        </div>
      </div>

      {/* Book Button */}
      <button
        onClick={() => onBook(lot)}
        disabled={avail === 0}
        style={{
          width:'100%', padding:'10px 0', borderRadius:12, border:'none',
          cursor: avail === 0 ? 'not-allowed' : 'pointer',
          background: avail === 0 ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #14b371, #0ea05e)',
          color: avail === 0 ? '#4b5563' : 'white',
          fontWeight:700, fontSize:14,
          display:'flex', alignItems:'center', justifyContent:'center', gap:8,
          boxShadow: avail > 0 ? '0 4px 12px rgba(20,179,113,0.35)' : 'none',
        }}
      >
        {avail === 0
          ? <span>🔴 Lot is Full</span>
          : <><RiParkingLine/> View Slots &amp; Book <RiArrowRightLine/></>
        }
      </button>
    </div>
  )
}

// ── Empty / No-search state ───────────────────────────────────────────────────
function EmptyState() {
  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:32, textAlign:'center' }}>
      <div style={{ width:64, height:64, borderRadius:20, background:'rgba(20,179,113,0.1)', border:'1px solid rgba(20,179,113,0.2)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:16 }}>
        <RiSearchLine style={{ fontSize:28, color:'#14b371' }}/>
      </div>
      <p style={{ color:'white', fontWeight:700, fontSize:15, margin:'0 0 6px' }}>Search for a Location</p>
      <p style={{ color:'#6b7280', fontSize:12, margin:0, lineHeight:1.5 }}>
        Type a city, area or address above — or tap <strong style={{ color:'#14b371' }}>Near Me</strong> — to discover available parking spots.
      </p>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
const DEFAULT_CENTER = [78.9629, 20.5937] // India
const DEFAULT_ZOOM   = 5

export default function MapPage() {
  const navigate = useNavigate()

  const [selected,      setSelected]      = useState(null)
  const [popupLot,      setPopupLot]      = useState(null)
  const [mapCenter,     setMapCenter]     = useState(DEFAULT_CENTER)
  const [mapZoom,       setMapZoom]       = useState(DEFAULT_ZOOM)
  const [search,        setSearch]        = useState('')
  const [suggestions,   setSuggestions]   = useState([])
  const [searching,     setSearching]     = useState(false)
  const [locating,      setLocating]      = useState(false)
  const [searchedPlace, setSearchedPlace] = useState(null)
  const [showFilter,    setShowFilter]    = useState(false)
  const [filters,       setFilters]       = useState({ type:'all', maxPrice:200, available:false, ev:false, open24h:false })
  const debounceRef = useRef(null)

  // Lots shown only after a place is searched; filtered by 15 km radius
  const visibleLots = useMemo(() => {
    if (!searchedPlace) return []
    return ALL_LOTS.filter(lot => {
      if (haversineKm(searchedPlace.lat, searchedPlace.lng, lot.lat, lot.lng) > 30) return false
      if (filters.available && lot.availableSpots === 0) return false
      if (filters.ev        && !lot.amenities.includes('ev'))  return false
      if (filters.open24h   && !lot.amenities.includes('24h')) return false
      if (filters.type !== 'all' && lot.type !== filters.type) return false
      if (lot.pricePerHour > filters.maxPrice) return false
      return true
    })
  }, [searchedPlace, filters])

  // Nominatim autocomplete
  const doSearch = useCallback((query) => {
    if (!query.trim()) { setSuggestions([]); return }
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      try {
        const res  = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`,
          { headers: { 'Accept-Language': 'en' } }
        )
        setSuggestions(await res.json())
      } catch { setSuggestions([]) }
      finally  { setSearching(false) }
    }, 400)
  }, [])

  const handleSearchChange = (e) => { setSearch(e.target.value); doSearch(e.target.value) }

  const applyPlace = useCallback((lat, lng, name) => {
    setSearchedPlace({ lat, lng, name })
    setMapCenter([lng, lat])
    setMapZoom(13)
    setSuggestions([])
    setPopupLot(null)
    setSelected(null)
  }, [])

  const selectSuggestion = (p) => {
    const lat = parseFloat(p.lat), lng = parseFloat(p.lon)
    const name = p.display_name.split(',')[0]
    setSearch(name)
    applyPlace(lat, lng, name)
  }

  const clearSearch = () => {
    setSearch(''); setSuggestions([])
    setSearchedPlace(null); setPopupLot(null); setSelected(null)
    setMapCenter(DEFAULT_CENTER); setMapZoom(DEFAULT_ZOOM)
  }

  const handleLocate = () => {
    setLocating(true)
    navigator.geolocation?.getCurrentPosition(
      ({ coords: { latitude: lat, longitude: lng } }) => {
        setSearch('Your Location')
        applyPlace(lat, lng, 'Your Location')
        setLocating(false)
        toast.success('Showing parking near you')
      },
      () => { toast.error('Location permission denied'); setLocating(false) }
    )
  }

  const handlePinClick = (lot) => {
    setSelected(lot); setPopupLot(lot)
    setMapCenter([lot.lng, lot.lat]); setMapZoom(15)
  }

  const handleBook = (lot) => navigate(`/book/${lot._id}`, { state: { lot } })

  return (
    <div style={{ height:'calc(100vh - 64px)', display:'flex', overflow:'hidden', background:'#060f0a' }}>

      {/* ── SIDEBAR ───────────────────────────────────────────────── */}
      <div style={{
        width:360, minWidth:360, display:'flex', flexDirection:'column',
        background:'rgba(8,20,14,0.98)',
        borderRight:'1px solid rgba(255,255,255,0.07)',
        position:'relative', zIndex:20,
      }}>

        {/* Search box */}
        <div style={{ padding:'12px 12px 8px', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ position:'relative', marginBottom:8 }}>
            <RiSearchLine style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'#6b7280' }}/>
            <input
              style={{
                width:'100%', padding:'9px 36px',
                background:'rgba(255,255,255,0.06)',
                border:'1px solid rgba(255,255,255,0.12)',
                borderRadius:10, color:'white', fontSize:13,
                outline:'none', boxSizing:'border-box',
              }}
              placeholder="Search city, area or address..."
              value={search}
              onChange={handleSearchChange}
              onKeyDown={e => e.key === 'Escape' && setSuggestions([])}
            />
            {(search || searching) && (
              <button onClick={clearSearch}
                style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'#6b7280', cursor:'pointer' }}>
                {searching
                  ? <RiLoader4Line style={{ animation:'spin 1s linear infinite' }}/>
                  : <RiCloseLine/>}
              </button>
            )}

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div style={{
                position:'absolute', top:'100%', left:0, right:0, marginTop:4,
                background:'#0f1f15', border:'1px solid rgba(255,255,255,0.1)',
                borderRadius:10, overflow:'hidden', zIndex:100,
                boxShadow:'0 8px 24px rgba(0,0,0,0.6)',
              }}>
                {suggestions.map((p, i) => (
                  <button key={i} onClick={() => selectSuggestion(p)}
                    style={{
                      width:'100%', textAlign:'left', padding:'9px 12px',
                      background:'none', border:'none', cursor:'pointer', color:'white',
                      borderBottom: i < suggestions.length-1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                      fontSize:12, display:'flex', alignItems:'center', gap:8,
                    }}
                    onMouseEnter={e => e.currentTarget.style.background='rgba(20,179,113,0.1)'}
                    onMouseLeave={e => e.currentTarget.style.background='none'}
                  >
                    <RiMapPin2Line style={{ color:'#14b371', flexShrink:0 }}/>
                    <div>
                      <div style={{ fontWeight:600, fontSize:13 }}>{p.display_name.split(',')[0]}</div>
                      <div style={{ color:'#6b7280', fontSize:11 }}>{p.display_name.split(',').slice(1,3).join(',').trim()}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={() => setShowFilter(!showFilter)} style={{
              flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6,
              padding:'8px 0', borderRadius:10, fontSize:13, cursor:'pointer',
              background: showFilter ? 'rgba(20,179,113,0.15)' : 'rgba(255,255,255,0.05)',
              border:'1px solid '+(showFilter ? 'rgba(20,179,113,0.4)' : 'rgba(255,255,255,0.1)'),
              color: showFilter ? '#14b371' : '#9ca3af',
            }}><RiFilterLine/> Filters</button>
            <button onClick={handleLocate} disabled={locating} style={{
              flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6,
              padding:'8px 0', borderRadius:10, fontSize:13, cursor: locating ? 'not-allowed' : 'pointer',
              background:'rgba(255,255,255,0.05)',
              border:'1px solid rgba(255,255,255,0.1)', color:'#9ca3af',
            }}>
              {locating
                ? <RiLoader4Line style={{ animation:'spin 1s linear infinite' }}/>
                : <RiNavigationLine style={{ color:'#14b371' }}/>}
              Near Me
            </button>
          </div>

          {/* Filters panel */}
          <AnimatePresence>
            {showFilter && (
              <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }}
                style={{ overflow:'hidden', marginTop:10, paddingTop:10, borderTop:'1px solid rgba(255,255,255,0.06)' }}>
                <p style={{ fontSize:11, color:'#6b7280', marginBottom:6 }}>Type</p>
                <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:10 }}>
                  {['all','covered','open','basement'].map(t => (
                    <button key={t} onClick={() => setFilters(f => ({...f, type:t}))} style={{
                      padding:'4px 10px', borderRadius:8, fontSize:12, cursor:'pointer', textTransform:'capitalize',
                      background: filters.type===t ? '#14b371' : 'rgba(255,255,255,0.05)',
                      border:'1px solid '+(filters.type===t ? '#14b371' : 'rgba(255,255,255,0.1)'),
                      color: filters.type===t ? 'white' : '#9ca3af',
                    }}>{t}</button>
                  ))}
                </div>
                <p style={{ fontSize:11, color:'#6b7280', marginBottom:4 }}>Max: ₹{filters.maxPrice}/hr</p>
                <input type="range" min="10" max="200" value={filters.maxPrice}
                  onChange={e => setFilters(f => ({...f, maxPrice:+e.target.value}))}
                  style={{ width:'100%', accentColor:'#14b371', marginBottom:8 }}/>
                <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
                  {[['available','Available only'],['ev','EV Charging'],['open24h','24/7 Open']].map(([k,l]) => (
                    <label key={k} style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, color:'#9ca3af', cursor:'pointer' }}>
                      <input type="checkbox" checked={filters[k]} onChange={e => setFilters(f => ({...f,[k]:e.target.checked}))} style={{ accentColor:'#14b371' }}/>{l}
                    </label>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Active place tag */}
        {searchedPlace && (
          <div style={{ padding:'6px 14px', background:'rgba(20,179,113,0.08)', borderBottom:'1px solid rgba(20,179,113,0.15)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <span style={{ fontSize:12, color:'#14b371', display:'flex', alignItems:'center', gap:5 }}>
              <RiMapPin2Line/> <strong>{searchedPlace.name}</strong>
            </span>
            <button onClick={clearSearch} style={{ background:'none', border:'none', color:'#6b7280', cursor:'pointer' }}>
              <RiCloseLine/>
            </button>
          </div>
        )}

        {/* Count row */}
        {searchedPlace && (
          <div style={{ padding:'6px 14px', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
            <span style={{ fontSize:12, color:'#6b7280' }}>
              <span style={{ color:'#14b371', fontWeight:600 }}>{visibleLots.length}</span> parking lots nearby
            </span>
          </div>
        )}

        {/* Lot list / empty */}
        {!searchedPlace ? <EmptyState/> : visibleLots.length === 0 ? (
          <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:32, textAlign:'center' }}>
            <RiParkingLine style={{ fontSize:36, color:'#374151', marginBottom:12 }}/>
            <p style={{ color:'#6b7280', fontSize:13, margin:0 }}>No parking lots found nearby.</p>
            <p style={{ color:'#4b5563', fontSize:11, margin:'4px 0 0' }}>Try adjusting filters or search a different area.</p>
          </div>
        ) : (
          <div style={{ flex:1, overflowY:'auto', padding:8 }}>
            {visibleLots.map(lot => {
              const avail      = lot.availableSpots
              const isSelected = selected?._id === lot._id
              const occupied   = lot.occupiedSpots ?? (lot.totalSpots - avail)
              return (
                <motion.div key={lot._id}
                  onClick={() => handlePinClick(lot)}
                  whileHover={{ scale:1.01 }}
                  style={{
                    padding:'12px 14px', borderRadius:14, marginBottom:8, cursor:'pointer',
                    border: isSelected ? '1px solid rgba(20,179,113,0.5)' : '1px solid rgba(255,255,255,0.07)',
                    background: isSelected ? 'rgba(20,179,113,0.08)' : 'rgba(255,255,255,0.02)',
                    transition:'all 0.15s',
                  }}
                >
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 }}>
                    <div style={{ flex:1, minWidth:0, paddingRight:8 }}>
                      <p style={{ fontWeight:600, fontSize:13, color:'white', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{lot.name}</p>
                      <p style={{ fontSize:11, color:'#6b7280', margin:'2px 0 0', display:'flex', alignItems:'center', gap:3 }}>
                        <RiMapPin2Line style={{ color:'#14b371', flexShrink:0 }}/>{lot.address}
                      </p>
                    </div>
                    <span style={{ fontSize:11, padding:'2px 8px', borderRadius:8, fontWeight:700, whiteSpace:'nowrap', background:slotBg(avail), color:slotColor(avail), border:`1px solid ${slotColor(avail)}33` }}>
                      {slotLabel(avail)}
                    </span>
                  </div>

                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:5, marginBottom:7 }}>
                    {[
                      { label:'Free',     value:avail,          color:slotColor(avail) },
                      { label:'Occupied', value:occupied,        color:'#f54242' },
                      { label:'Total',    value:lot.totalSpots,  color:'#e0e0e0' },
                    ].map(({ label, value, color }) => (
                      <div key={label} style={{ textAlign:'center', background:'rgba(255,255,255,0.03)', borderRadius:8, padding:'4px 2px', border:`1px solid ${color}22` }}>
                        <p style={{ color, fontWeight:800, fontSize:14, margin:0 }}>{value}</p>
                        <p style={{ color:'#4b5563', fontSize:9, margin:0 }}>{label}</p>
                      </div>
                    ))}
                  </div>

                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                    <Stars rating={lot.rating}/>
                    <span style={{ color:'#14b371', fontWeight:700, fontSize:13 }}>₹{lot.pricePerHour}/hr</span>
                  </div>

                  {(lot.amenities.includes('ev') || lot.amenities.includes('24h')) && (
                    <div style={{ display:'flex', gap:6, marginBottom:6 }}>
                      {lot.amenities.includes('ev')  && <span style={{ fontSize:10, color:'#f5e642', display:'flex', alignItems:'center', gap:2 }}><RiFlashlightLine/>EV</span>}
                      {lot.amenities.includes('24h') && <span style={{ fontSize:10, color:'#90b4f5', display:'flex', alignItems:'center', gap:2 }}><RiMoonLine/>24/7</span>}
                    </div>
                  )}

                  <div style={{ height:3, background:'rgba(255,255,255,0.07)', borderRadius:4, overflow:'hidden' }}>
                    <div style={{ height:'100%', borderRadius:4, width:`${((lot.totalSpots - avail)/lot.totalSpots)*100}%`, background:slotColor(avail) }}/>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── MAP ──────────────────────────────────────────────────────── */}
      <div style={{ flex:1, position:'relative' }}>

        {/* Hint overlay when no place selected */}
        {!searchedPlace && (
          <div style={{
            position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)',
            zIndex:10, pointerEvents:'none', textAlign:'center',
          }}>
            <div style={{
              background:'rgba(8,20,14,0.88)', border:'1px solid rgba(20,179,113,0.25)',
              borderRadius:16, padding:'20px 32px', backdropFilter:'blur(12px)',
            }}>
              <RiSearchLine style={{ fontSize:32, color:'#14b371', marginBottom:8 }}/>
              <p style={{ color:'white', fontWeight:700, fontSize:15, margin:'0 0 4px' }}>Search a Location</p>
              <p style={{ color:'#6b7280', fontSize:12, margin:0 }}>Use the search bar or "Near Me" to find parking</p>
            </div>
          </div>
        )}

        <Map theme="dark" center={mapCenter} zoom={mapZoom} style={{ width:'100%', height:'100%' }}>

          {/* Parking pins */}
          {visibleLots.map(lot => (
            <ParkingPin key={lot._id} lot={lot} selected={selected?._id === lot._id} onClick={() => handlePinClick(lot)}/>
          ))}

          {/* Searched-place marker (blue dot) */}
          {searchedPlace && (
            <MapMarker longitude={searchedPlace.lng} latitude={searchedPlace.lat}>
              <MarkerContent>
                <div style={{
                  width:28, height:28,
                  background:'linear-gradient(135deg,#3b82f6,#1d4ed8)',
                  borderRadius:'50%', border:'3px solid white',
                  boxShadow:'0 0 0 3px rgba(59,130,246,0.4),0 4px 12px rgba(0,0,0,0.5)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                }}>
                  <RiMapPin2Line style={{ color:'white', fontSize:13 }}/>
                </div>
              </MarkerContent>
            </MapMarker>
          )}

          {/* Popup card */}
          {popupLot && (
            <MapPopup
              longitude={popupLot.lng}
              latitude={popupLot.lat}
              onClose={() => { setPopupLot(null); setSelected(null) }}
            >
              <LotPopupCard
                lot={popupLot}
                onClose={() => { setPopupLot(null); setSelected(null) }}
                onBook={handleBook}
              />
            </MapPopup>
          )}

          {/* Map controls */}
          <MapControls position="bottom-right" showZoom showLocate onLocate={({ longitude, latitude }) => {
            setSearch('Your Location')
            applyPlace(latitude, longitude, 'Your Location')
            toast.success('Showing parking near you')
          }}/>
        </Map>
      </div>
    </div>
  )
}
