import React, { useState } from 'react';
import { Container, Typography, Switch, FormGroup, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';

const LetterSwitch = styled(Switch)(({ theme }) => ({
  width: 50,
  height: 30,
  padding: 0,
  '& .MuiSwitch-switchBase': {
    padding: 0,
    margin: 2,
    transitionDuration: '300ms',
    '&.Mui-checked': {
      transform: 'translateX(20px)',
      color: '#fff',
      '& + .MuiSwitch-track': {
        backgroundColor: '#1976d2',
        opacity: 1,
        border: 0,
      },
      '& .MuiSwitch-thumb': {
        '&::after': {
          content: 'attr(data-checked)',
        },
      },
    },
    '& .MuiSwitch-thumb': {
      '&::after': {
        content: 'attr(data-unchecked)',
      },
    },
  },
  '& .MuiSwitch-thumb': {
    boxSizing: 'border-box',
    width: 26,
    height: 26,
    borderRadius: 4,
    backgroundColor: '#fff',
    position: 'relative',
    '&::after': {
      position: 'absolute',
      width: '100%',
      height: '100%',
      left: 0,
      top: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 14,
      fontWeight: 'bold',
      color: '#1976d2',
    }
  },
  '& .MuiSwitch-track': {
    borderRadius: 6,
    backgroundColor: '#E9E9EA',
    opacity: 1,
    transition: theme.transitions.create(['background-color'], {
      duration: 500,
    }),
  },
}));

const CustomSwitch = ({ checked, onChange, uncheckedLetter, checkedLetter, label }) => (
  <div className="switch-item">
    <LetterSwitch
      checked={checked}
      onChange={onChange}
      componentsProps={{
        thumb: {
          'data-checked': `"${checkedLetter}"`,
          'data-unchecked': `"${uncheckedLetter}"`,
        }
      }}
    />
    <Typography className="switch-label">
      {label}
    </Typography>
  </div>
);

const MBTI_RELATIONSHIPS = {
  // 理想搭档
  ideal: [
    ['INFP', 'ENFJ'], ['ENFJ', 'INFP'],
    ['INFJ', 'ENFP'], ['ENFP', 'INFJ'],
    ['INTJ', 'ENTP'], ['ENTP', 'INTJ'],
    ['INTP', 'ENTJ'], ['ENTJ', 'INTP'],
    ['ISFP', 'ESFJ'], ['ESFJ', 'ISFP'],
    ['ISFJ', 'ESFP'], ['ESFP', 'ISFJ'],
    ['ISTJ', 'ESTP'], ['ESTP', 'ISTJ'],
    ['ISTP', 'ESTJ'], ['ESTJ', 'ISTP']
  ],
  // 比较容易相处
  compatible: [
    ['INFP', 'INFP'], ['ENFJ', 'ENFJ'],
    ['INFJ', 'INFJ'], ['ENFP', 'ENFP'],
    ['INTJ', 'INTJ'], ['ENTP', 'ENTP'],
    ['INTP', 'INTP'], ['ENTJ', 'ENTJ'],
    ['ISFP', 'ISFP'], ['ESFJ', 'ESFJ'],
    ['ISFJ', 'ISFJ'], ['ESFP', 'ESFP'],
    ['ISTJ', 'ISTJ'], ['ESTP', 'ESTP'],
    ['ISTP', 'ISTP'], ['ESTJ', 'ESTJ']
  ],
  // 潜在冲突
  conflicting: [
    ['INFP', 'ESTJ'], ['ENFJ', 'ISTP'],
    ['INFJ', 'ESTP'], ['ENFP', 'ISTJ'],
    ['INTJ', 'ESFJ'], ['ENTP', 'ISFJ'],
    ['INTP', 'ESFP'], ['ENTJ', 'ISFP']
  ]
};

const COGNITIVE_FUNCTIONS = {
  INFP: ['Fi', 'Ne', 'Si', 'Te'],
  ENFJ: ['Fe', 'Ni', 'Se', 'Ti'],
  INFJ: ['Ni', 'Fe', 'Ti', 'Se'],
  ENFP: ['Ne', 'Fi', 'Te', 'Si'],
  INTJ: ['Ni', 'Te', 'Fi', 'Se'],
  ENTP: ['Ne', 'Ti', 'Fe', 'Si'],
  INTP: ['Ti', 'Ne', 'Si', 'Fe'],
  ENTJ: ['Te', 'Ni', 'Se', 'Fi'],
  ISFP: ['Fi', 'Se', 'Ni', 'Te'],
  ESFJ: ['Fe', 'Si', 'Ne', 'Ti'],
  ISFJ: ['Si', 'Fe', 'Ti', 'Ne'],
  ESFP: ['Se', 'Fi', 'Te', 'Ni'],
  ISTJ: ['Si', 'Te', 'Fi', 'Ne'],
  ESTP: ['Se', 'Ti', 'Fe', 'Ni'],
  ISTP: ['Ti', 'Se', 'Ni', 'Fe'],
  ESTJ: ['Te', 'Si', 'Ne', 'Fi']
};

function App() {
  const [personality1, setPersonality1] = useState({
    E: false, // I/E
    N: false, // N/S
    F: false, // F/T
    J: false  // J/P
  });

  const [personality2, setPersonality2] = useState({
    E: false,
    N: false,
    F: false,
    J: false
  });

  const getPersonalityType = (personality) => {
    return (personality.E ? 'E' : 'I') +
           (personality.N ? 'N' : 'S') +
           (personality.F ? 'F' : 'T') +
           (personality.J ? 'J' : 'P');
  };

  const getRelationshipType = (type1, type2) => {
    if (MBTI_RELATIONSHIPS.ideal.some(([a, b]) => 
      (a === type1 && b === type2) || (a === type2 && b === type1))) {
      return '理想搭档';
    }
    
    if (MBTI_RELATIONSHIPS.compatible.some(([a, b]) => 
      (a === type1 && b === type2) || (a === type2 && b === type1))) {
      return '比较容易相处';
    }
    
    if (MBTI_RELATIONSHIPS.conflicting.some(([a, b]) => 
      (a === type1 && b === type2) || (a === type2 && b === type1))) {
      return '潜在冲突';
    }
    
    return '一般关系';
  };

  const type1 = getPersonalityType(personality1);
  const type2 = getPersonalityType(personality2);
  const relationshipType = getRelationshipType(type1, type2);

  return (
    <Container className="container">
      <Typography variant="h4" gutterBottom>
        MBTI人格关系速查
      </Typography>

      <Paper className="personality-selector">
        <Typography variant="h6">第一个人格</Typography>
        <FormGroup 
          sx={{ 
            flexDirection: 'row', 
            justifyContent: 'space-between',
            gap: '40px',
            padding: '0 20px'
          }}
        >
          <CustomSwitch
            checked={personality1.E}
            onChange={(e) => setPersonality1({...personality1, E: e.target.checked})}
            uncheckedLetter="I"
            checkedLetter="E"
            label="(外向/内向)"
          />
          <CustomSwitch
            checked={personality1.N}
            onChange={(e) => setPersonality1({...personality1, N: e.target.checked})}
            uncheckedLetter="S"
            checkedLetter="N"
            label="(直觉/感知)"
          />
          <CustomSwitch
            checked={personality1.F}
            onChange={(e) => setPersonality1({...personality1, F: e.target.checked})}
            uncheckedLetter="T"
            checkedLetter="F"
            label="(情感/思维)"
          />
          <CustomSwitch
            checked={personality1.J}
            onChange={(e) => setPersonality1({...personality1, J: e.target.checked})}
            uncheckedLetter="P"
            checkedLetter="J"
            label="(判断/知觉)"
          />
        </FormGroup>
        <Typography variant="body1">
          选择的人格类型：{type1}
        </Typography>
        <div className="cognitive-functions">
          <Typography variant="subtitle1">认知功能：</Typography>
          <Typography variant="body2">
            {COGNITIVE_FUNCTIONS[type1]?.join(' > ') || '请选择完整的人格类型'}
          </Typography>
        </div>
      </Paper>

      <Paper className="personality-selector">
        <Typography variant="h6">第二个人格</Typography>
        <FormGroup 
          sx={{ 
            flexDirection: 'row', 
            justifyContent: 'space-between',
            gap: '40px',
            padding: '0 20px'
          }}
        >
          <CustomSwitch
            checked={personality2.E}
            onChange={(e) => setPersonality2({...personality2, E: e.target.checked})}
            uncheckedLetter="I"
            checkedLetter="E"
            label="(外向/内向)"
          />
          <CustomSwitch
            checked={personality2.N}
            onChange={(e) => setPersonality2({...personality2, N: e.target.checked})}
            uncheckedLetter="S"
            checkedLetter="N"
            label="(直觉/感知)"
          />
          <CustomSwitch
            checked={personality2.F}
            onChange={(e) => setPersonality2({...personality2, F: e.target.checked})}
            uncheckedLetter="T"
            checkedLetter="F"
            label="(情感/思维)"
          />
          <CustomSwitch
            checked={personality2.J}
            onChange={(e) => setPersonality2({...personality2, J: e.target.checked})}
            uncheckedLetter="P"
            checkedLetter="J"
            label="(判断/知觉)"
          />
        </FormGroup>
        <Typography variant="body1">
          选择的人格类型：{type2}
        </Typography>
        <div className="cognitive-functions">
          <Typography variant="subtitle1">认知功能：</Typography>
          <Typography variant="body2">
            {COGNITIVE_FUNCTIONS[type2]?.join(' > ') || '请选择完整的人格类型'}
          </Typography>
        </div>
      </Paper>

      <Paper className="relationship-result">
        <Typography variant="h6">关系分析</Typography>
        <Typography variant="body1">
          {type1} 和 {type2} 的关系类型：{relationshipType}
        </Typography>
      </Paper>
    </Container>
  );
}

export default App; 