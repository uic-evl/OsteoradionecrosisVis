import React, {useState} from 'react';
import { Button, Modal, ModalOverlay, ModalContent,ModalHeader,ModalFooter,ModalBody,ModalCloseButton,useDisclosure} from '@chakra-ui/react';
import { Progress } from '@chakra-ui/react';
import model from '../model.png';

const dataText: JSX.Element = (
<p>
  This model was trained on a cohort of 1470 patients from an observational cohort 
  from the MD Anderson Cancer Center (Stiefel Oropharynx Cancer Cohort, PA14-0947).
  Patients in this cohort included all consented RT cases with curative intent from 2005 to 2022. 
  Patients undergoing RT for HNC are closely followed up with clinical and radiological assessments every 3 to 6, 12, 
  18-24 months then approximately annually after the end of the RT course. 
  The severity of ORNJ in the training and internal validation cohort was staged using Tsai’s classification.
  <br></br>
  An external cohort was obtained retrospectively from the HNC clinical database maintained at Guy and St. Thomas under the Northwest - Haydock Research Ethics Committee 
  of the NHS Health Research Authority (REC reference 18/NW/0297, IRAS project ID: 231443); patients treated between 2011 and 2022 were included. 
  A total of 1721 HNC patients were radically treated with RT at GSTT between the considered time range. 
  Of these, 142 patients (8.3%) were diagnosed with ORN, 50 of which were unavailable for analysis because of lack of DICOM files (18), 
  ORNJ region outside the HN region (6) or having two primary tumor sites (3). The GSTT clinical protocol for HNC patients includes clinical follow up for 5 years. 
  ORNJ cases were staged using the Notani staging system. 
  Control subjects were retrospectively matched with a 2:1 ratio based on primary tumor site and treatment year.  
  <br></br>
  In the MDACC Cohort ORN was observed in 192 (13%) patients at the end of follow-up period, with a median time to event of 20.4 months (IQR 34.64).  
  The median follow-up time for the censored group was 63.1 months (IQR 63.7).
  The external validation cohort consisted of 92 ORN subjects and 173 controls matched on primary tumor site and treatment year. 
  The median time to event in the valdiation cohort was 13.6 months (IQR 20.3), and the median follow-up time for the control group was 47.3 months (IQR 24.2). 
</p>
)

const modelText: JSX.Element = (
<p>
  Our model uses a Weibull Advanced Failure Rate model trained using the lifelines package
  <a href='https://lifelines.readthedocs.io/en/latest/fitters/regression/WeibullAFTFitter.html' target="_blank" style={{'color':"blue"}}> (Described Here) </a>
  <br></br>
  The final model for ORN-Free survival is given by:
  <div style={{'width':'100%','height':'500px','justifyContent':'center','display':'flex'}}>
    <img style={{'width':'500px','height':'100%','objectFit':'contain'}} src={model}/>
  </div>
  Where t is time given in months, 
  D30 is the dose in greys that 30% of the mandible recieves, 
  Dental is 1 if the patient received a dental extraction (otherwise 0), 
  and Smoking is 1 if the patient currently smokes (otherwise 0)
</p>
)
export default function About(props){

  const images: string[] = ['','']
  const titles: string[] = [
    'Model','Data'
  ]

  const texts: JSX.Element[] = [
    modelText,
    dataText,
  ]

  const [stage,setStage] = useState<number>(0);
  const { isOpen, onOpen, onClose } = useDisclosure()

  const incrementStage = (direction)=>{
    let newStage = direction > 0? stage + 1: stage - 1;
    if(newStage < 0 || newStage >= images.length){
      newStage = 0;
    }
    setStage(newStage)
  }

  //event handler for key presses (up/down for incrementing brush event)
  function handleKeyPress(e: any){
    e.preventDefault();
    if(e.keyCode === 37){
        incrementStage(-1)
    } else if(e.keyCode === 39){
        incrementStage(1)
    }
  }
  const style = props.style||{};
  return (
    <div  style={style} className={"tutorial"} onKeyUp={handleKeyPress}>
      <Button onClick={onOpen} className={'modalButton'}>About</Button>
      <Modal isOpen={isOpen}  onClose={onClose}>
        <ModalOverlay />
        <ModalContent height="fit-content" minW="min(80vw, 80em)" maxH="90%" >
        <ModalHeader className={'centerText'}>{titles[stage]}</ModalHeader>
          <ModalCloseButton />
          <ModalBody style={{'margin':'2em'}}>
            {texts[stage]}
            {images[stage] !== ''? <img style={{'objectFit':'contain','width':'500px','height':'500px'}} src={images[stage]}/>: <></>}
          </ModalBody>
          <Progress style={{'width':'90%','left':'5%'}} value={100*(stage+.01)/(images.length-.99)}/>
          <ModalFooter display={'flex'} justifyContent={'space-between'}>
            <Button onClick={() => incrementStage(-1)} variant='outline'>Previous</Button>
            <Button onClick={() => incrementStage(1)} variant='outline'>Next</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}