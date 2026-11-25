import i18n from 'i18next'
import {initReactI18next} from 'react-i18next'
const en={Buy:'Buy',Rent:'Rent',Plots:'Plots',Commercial:'Commercial',PG:'PG',Search:'Search properties',Location:'City or locality',Type:'Property type',Budget:'Budget',Login:'Log in',List:'List your property',Saved:'Saved properties',Compare:'Compare',Map:'Explore map',Tools:'Calculators',All:'All properties',Studio:'Plot Studio'}
const hi={Buy:'खरीदें',Rent:'किराए पर लें',Plots:'प्लॉट',Commercial:'व्यावसायिक',PG:'पीजी',Search:'संपत्ति खोजें',Location:'शहर या इलाका',Type:'संपत्ति का प्रकार',Budget:'बजट',Login:'लॉग इन',List:'संपत्ति सूचीबद्ध करें',Saved:'सहेजी गई संपत्तियाँ',Compare:'तुलना',Map:'मानचित्र देखें',Tools:'कैलकुलेटर',All:'सभी संपत्तियाँ',Studio:'प्लॉट स्टूडियो'}
void i18n.use(initReactI18next).init({lng:localStorage.getItem('habitat-language')==='hi'?'hi':'en',fallbackLng:'en',resources:{en:{translation:en},hi:{translation:hi}},interpolation:{escapeValue:false}})
i18n.on('languageChanged',language=>{document.documentElement.lang=language;localStorage.setItem('habitat-language',language)})
document.documentElement.lang=i18n.language||'en'
export default i18n
