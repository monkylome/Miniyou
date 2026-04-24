import { SceneManager } from './scenes/manager.js'
import './styles/main.css'

const sm = new SceneManager(document.getElementById('app'))
sm.goto('title')
