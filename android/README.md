# MoodCurator Android App

A Kotlin-based Android application that replicates the MoodCurator web app functionality. This app allows users to input their mood and receive AI-powered entertainment recommendations (Movies, TV Shows, YouTube Videos).

## Features

- **Mood Input**: Enter your current mood or desired vibe
- **AI Recommendations**: Get personalized entertainment recommendations
- **History**: View past mood searches and recommendations
- **Beautiful UI**: Dark theme with purple/cyan accents matching the web app
- **Smooth Animations**: Polished transitions and interactions

## Prerequisites

- Android Studio Hedgehog (2023.1.1) or later
- JDK 17 or later
- Android SDK with API level 24+ (Android 7.0+)
- Your MoodCurator backend server running (from the parent directory)

## Setup Instructions

### 1. Configure Server URL

Before running the app, you need to configure the server URL in `app/src/main/java/com/moodcurator/app/data/api/RetrofitClient.kt`:

```kotlin
// For Android Emulator
private const val BASE_URL = "http://10.0.2.2:5000"

// For Physical Device (replace with your computer's IP address)
// private const val BASE_URL = "http://192.168.x.x:5000"
```

**Note**: 
- `10.0.2.2` is the special IP address that points to `localhost` on your development machine when using the Android emulator
- For physical devices, use your computer's local IP address (e.g., `192.168.1.100:5000`)

### 2. Start Your Backend Server

Make sure your MoodCurator backend server is running. From the project root:

```bash
npm run dev
```

The server should be running on port 5000 (or your configured port).

### 3. Build and Run

1. Open the `android` folder in Android Studio
2. Wait for Gradle sync to complete
3. Connect an Android device or start an emulator
4. Click "Run" or press `Shift+F10`

## Project Structure

```
android/
├── app/
│   ├── src/
│   │   └── main/
│   │       ├── java/com/moodcurator/app/
│   │       │   ├── data/
│   │       │   │   ├── api/          # API service and Retrofit client
│   │       │   │   └── model/        # Data models
│   │       │   ├── ui/
│   │       │   │   ├── components/   # Reusable UI components
│   │       │   │   ├── screens/      # Screen composables
│   │       │   │   ├── theme/        # Theme, colors, typography
│   │       │   │   └── viewmodel/    # ViewModels
│   │       │   └── MainActivity.kt   # Main activity
│   │       └── res/                   # Resources (strings, themes)
│   └── build.gradle.kts               # App-level build config
├── build.gradle.kts                   # Project-level build config
└── settings.gradle.kts                # Project settings
```

## Key Components

### UI Components
- **MoodInput**: Text input with suggestions and submit button
- **RecommendationCard**: Displays individual recommendations with type badges
- **HistorySidebar**: Modal bottom sheet showing search history

### Screens
- **HomeScreen**: Main screen with hero section, input, and results grid

### Data Layer
- **ApiService**: Retrofit interface for API calls
- **RetrofitClient**: Configured Retrofit instance
- **HomeViewModel**: Manages UI state and API calls

## API Endpoints

The app connects to the following endpoints:

- `POST /api/recommendations` - Create recommendations from mood
- `GET /api/history` - Get search history

## Styling

The app uses Material 3 with a custom dark theme that matches the web app:
- **Background**: Deep midnight (`#0A0A0F`)
- **Primary**: Vibrant purple (`#A855F7`)
- **Accent**: Electric cyan (`#06B6D4`)
- **Type Colors**: Purple (Movies), Blue (TV Shows), Red (YouTube)

## Troubleshooting

### App can't connect to server

1. **Emulator**: Make sure you're using `http://10.0.2.2:5000`
2. **Physical Device**: 
   - Find your computer's IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
   - Update `BASE_URL` in `RetrofitClient.kt`
   - Ensure your phone and computer are on the same network
   - Check firewall settings

### Build errors

- Make sure you're using Android Studio Hedgehog or later
- Sync Gradle: `File > Sync Project with Gradle Files`
- Clean and rebuild: `Build > Clean Project`, then `Build > Rebuild Project`

### API errors

- Verify your backend server is running
- Check the server logs for errors
- Ensure the API endpoints match your backend configuration

## License

Same as the parent MoodCurator project.






