import React, { useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { TextArea, StatusLight } from '../atoms'
import { PillSelector } from '../molecules'
import { useDebounce } from '../../utils/hooks'

const JapaneseInput = props => {
  // State Hooks
  var [inputValue, setInputValue] = useState('')
  var [kanjiMode, setKanjiMode] = useState('off')
  var [kanijSuggestions, setKanjiSuggestions] = useState([])
  var [kanjiList, setKanjiList] = useState([])

  // Ref Hooks
  var textArea = useRef(null)
  var translationStart = useRef(0)
  var deletionOccurred = useRef(false)
  var cursorLocation = useRef(0)
  var applyingTranslation = useRef(false)
  var kanjiLocation = useRef(-1)
  var kanjiInput = useRef("")

  // Debounce Hooks
  var savedInput = useDebounce(inputValue, 500)

  // Effect Hooks
  useEffect(() => {
    // Exit if empty
    if (inputValue === "")
      return

    // Only run if not deletion or we are not applying translation
    if (deletionOccurred.current) {
      deletionOccurred.current = false
      getRomaji()
      return
    }
    else if (applyingTranslation.current) {
      applyingTranslation.current = false
      putCursor()
      return
    }

    // Debouncing the translation
    const timer = setTimeout(() => {

      // Throw up the romaji
      getRomaji()

      // Set Translation gaurd
      applyingTranslation.current = true

      // Pull out piece to translate
      var translation = inputValue.substring(translationStart.current, textArea.current.selectionStart)

      // Do the translation
      translation = wanakana.toKana(translation, { customKanaMapping: { nn: 'ん', NN: 'ン' } })

      // Determine cursor location
      console.log("SETTING CURSOR IN TIMEOUT TO: " + (translationStart.current + translation.length))
      cursorLocation.current = translationStart.current + translation.length

      // Complete translation
      translation = inputValue.substring(0, translationStart.current) + translation + inputValue.substring(textArea.current.selectionStart)

      // Clear out trandlation start
      translationStart.current = -1

      // Set inputvalue
      setInputValue(translation)

      // If in kanji mode fetch the suggestions
      if (kanjiMode === "on") {

        // Cut the kanji input out
        kanjiInput.current = translation.substring(kanjiLocation.current, cursorLocation.current)

        // Get suggestions
        setKanjiSuggestions(AutoKanji.find(kanjiInput.current))
      }

    }, 500)

    // Cleanup the timer 
    return () => clearTimeout(timer)
  }, [inputValue])

  useEffect(() => {
    if(props.onSave){
      props.onSave(savedInput)
    }
  }, [savedInput])

  useEffect(() => {
    if(props.initialValue || (props.initialValue == "")) {
      setInputValue(props.initialValue)
    }
  }, [props.initialValue])

  // Functions
  const putCursor = () => {
    if (cursorLocation.current != -1) {
      textArea.current.focus();
      textArea.current.setSelectionRange(cursorLocation.current, cursorLocation.current);
    }
  }

  const getRomaji = () => {
    let kanaTokens = wanakana.tokenize(inputValue, { detailed: true })
    let romaji = ''

    kanaTokens.forEach(token => {
      if (token.type === "hiragana" || token.type === "katakana")
        romaji += wanakana.toRomaji(token.value, { upcaseKatakana: true, customKanaMapping: { ん: 'nn', ン: 'NN' } })
      else if(token.type === "kanji") {
        var result = kanjiList.find(x => x.kanji === token.value)

        if(result)
          romaji += result.romaji
        else
          romaji += token.value
      }
      else
        romaji += token.value
    })

    props.onRomajiUpdate(romaji)
  }

  const parseKeyPress = e => {
    // Check kanji mode validation
    kanjiModeValidation(e)

    // Set translation start
    if (translationStart.current === -1 || textArea.current.selectionStart < translationStart.current)
      translationStart.current = textArea.current.selectionStart

    // Check hotkeys
    if(e.keyCode === 75) {
      // Control K: Kanji mode toggle
      if (e.ctrlKey) {
        if (kanjiMode === 'off') {
          setKanjiMode('on')
          kanjiLocation.current = textArea.current.selectionStart
        }
        else {
          setKanjiMode('off')
          kanjiLocation.current = -1
        }
      }
    } else if(e.keyCode === 8 || e.keycode === 46) {
      // Deletion
      deletionOccurred.current = true
    } else if(e.keyCode >= 97 && e.keyCode <= 105) {
      // Control Numpad: Kanji selection
      selectKanji(e.keyCode - 97)
    } else if(e.keyCode >= 49 && e.keyCode <= 57) {
      // Control Number: Kanji selection
      selectKanji(e.keyCode - 49)
    }
  }

  const kanjiModeValidation = (e) => {
    // Capture cursor location
    var curr = textArea.current.selectionStart

    if (e.keyCode && e.keyCode === 8)
      curr--

    // Check if we traveled behind kanji mode start
    if (kanjiMode === 'on' && curr <= (kanjiLocation.current - 1))
      setKanjiMode('off')
  }

  const selectKanji = (index) => {
    // Validate index
    if(kanijSuggestions.length === 0 || kanijSuggestions.length < index)
      return

    // Save selection
    let kanjiValue = "" 
    let hiraganaValue = kanjiInput.current
    
    wanakana.tokenize(kanijSuggestions[index], { detailed: true }).forEach( x => {
      if(x.type === "kanji")
        kanjiValue += x.value
      else if(x.type === "hiragana")
        hiraganaValue = hiraganaValue.replace(x.value, "")
    })
    
    kanjiList.push({kanji: kanjiValue, hiragana: hiraganaValue, romaji: wanakana.toRomaji(hiraganaValue)})
    setKanjiList(kanjiList)
    
    // Update input
    var newInput = inputValue.substring(0, kanjiLocation.current)
    newInput += kanijSuggestions[index]
    newInput += inputValue.substring(kanjiLocation.current + kanjiInput.current.length)

    setInputValue(newInput)

    // Clean up
    kanjiLocation.current = -1
    kanjiInput.current = ""
    setKanjiMode('off')
    setKanjiSuggestions([])
  }

  const blurCleanup = () => {
    console.log("SETTING CURSOR IN TIMEOUT TO: " + -1)
    cursorLocation.current = -1
    translationStart.current = -1
  }

  const clickCleanup = (e) => {
    console.log("SETTING CURSOR IN CLICK TO: " + -1)
    cursorLocation.current = -1
    translationStart.current = -1

    kanjiModeValidation(e);
  }


  // Render
  return (
    <div className="d-flex flex-column flex-grow-1">
      <TextArea
        className="flex-grow-1"
        ref={textArea}
        rows={props.rows}
        value={inputValue}
        onChange={e => setInputValue(e.target.value)}
        onKeyDown={e => parseKeyPress(e)}
        onClick={e => clickCleanup(e)}
        onBlur={() => blurCleanup()}/>
      <div style={{ display: 'inline-block' }}>
        <StatusLight status={kanjiMode} label="漢字" japanese={true} />
        <PillSelector selections={kanijSuggestions} isJapanese={true} onClick={i => selectKanji(i)} />
      </div>

    </div>
  )
}

// Proptypes
JapaneseInput.propTypes = {
  rows: PropTypes.string,
  onRomajiUpdate: PropTypes.func,
  onSave: PropTypes.func,
  initialValue: PropTypes.string
}

export default JapaneseInput
