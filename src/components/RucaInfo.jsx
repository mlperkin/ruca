import Tooltip, { tooltipClasses } from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import InfoIcon from "@mui/icons-material/Info";
import Typography from "@mui/material/Typography";
import { Divider } from "@mui/material";
import { styled } from "@mui/material/styles";

const TooltipContent = () => {
  const listItemStyle = {
    listStyleType: "none", // Remove bullet points
    fontSize: "1.1em", // Increase font size
  };

  const numberStyle = {
    fontSize: "1.3em",
    fontWeight: "bold", // Make the number bold
  };

  return (
    <div
      style={{
        maxHeight: "700px",
        overflowY: "auto",
        fontSize: "14px",
        padding: "10px",
      }}
    >
      <Typography
        variant="subtitle1"
        color="inherit"
        style={{ fontWeight: 600 }}
      >
        Primary RUCA Codes, 2010
      </Typography>
      <Divider style={{ backgroundColor: "white" }} />
      <ul>
        <li style={listItemStyle}>
          <span style={numberStyle}>1</span> - Metropolitan area core: primary
          flow within an urbanized area (UA)
        </li>
        <li style={listItemStyle}>
          <span style={numberStyle}>2</span> - Metropolitan area high commuting:
          primary flow 30% or more to a UA
        </li>
        <li style={listItemStyle}>
          <span style={numberStyle}>3</span> - Metropolitan area low commuting:
          primary flow 10% to 30% to a UA
        </li>
        <li style={listItemStyle}>
          <span style={numberStyle}>4</span> - Micropolitan area core: primary
          flow within an Urban Cluster of 10,000 to 49,999 (large UC)
        </li>
        <li style={listItemStyle}>
          <span style={numberStyle}>5</span> - Micropolitan high commuting:
          primary flow 30% or more to a large UC
        </li>
        <li style={listItemStyle}>
          <span style={numberStyle}>6</span> - Micropolitan low commuting:
          primary flow 10% to 30% to a large UC
        </li>
        <li style={listItemStyle}>
          <span style={numberStyle}>7</span> - Small town core: primary flow
          within an Urban Cluster of 2,500 to 9,999 (small UC)
        </li>
        <li style={listItemStyle}>
          <span style={numberStyle}>8</span> - Small town high commuting:
          primary flow 30% or more to a small UC
        </li>
        <li style={listItemStyle}>
          <span style={numberStyle}>9</span> - Small town low commuting: primary
          flow 10% to 30% to a small UC
        </li>
        <li style={listItemStyle}>
          <span style={numberStyle}>10</span> - Rural areas: primary flow to a
          tract outside a UA or UC
        </li>
        <li style={listItemStyle}>
          <span style={numberStyle}>99</span> - Not coded: Census tract has zero
          population and no rural-urban identifier information
        </li>
      </ul>

      <Typography
        variant="subtitle1"
        color="inherit"
        style={{ fontWeight: 600 }}
      >
        Secondary RUCA Codes, 2010
      </Typography>
      <Divider style={{ backgroundColor: "white" }} />
      <ul>
        <li style={listItemStyle}>
          <span style={numberStyle}>1</span> - Metropolitan area core: primary
          flow within an urbanized area (UA)
        </li>

        <li style={listItemStyle}>
          <span style={numberStyle}>1.1</span> - Secondary flow 30% to 50% to a
          larger UA
        </li>
        <li style={listItemStyle}>
          <span style={numberStyle}>2</span> - Metropolitan area high commuting:
          primary flow 30% or more to a UA
        </li>

        <li style={listItemStyle}>
          <span style={numberStyle}>2.1</span> - Secondary flow 30% to 50% to a
          larger UA
        </li>
        <li style={listItemStyle}>
          <span style={numberStyle}>3</span> - Metropolitan area low commuting:
          primary flow 10% to 30% to a UA
        </li>

        <li style={listItemStyle}>
          <span style={numberStyle}>4</span> - Micropolitan area core: primary
          flow within an Urban Cluster of 10,000 to 49,999 (large UC)
        </li>

        <li style={listItemStyle}>
          <span style={numberStyle}>4.1</span> - Secondary flow 30% to 50% to a
          UA
        </li>
        <li style={listItemStyle}>
          <span style={numberStyle}>5</span> - Micropolitan high commuting:
          primary flow 30% or more to a large UC
        </li>

        <li style={listItemStyle}>
          <span style={numberStyle}>5.1</span> - Secondary flow 30% to 50% to a
          UA
        </li>
        <li style={listItemStyle}>
          <span style={numberStyle}>6</span> - Micropolitan low commuting:
          primary flow 10% to 30% to a large UC
        </li>

        <li style={listItemStyle}>
          <span style={numberStyle}>7</span> - Small town core: primary flow
          within an Urban Cluster of 2,500 to 9,999 (small UC)
        </li>

        <li style={listItemStyle}>
          <span style={numberStyle}>7.1</span> - Secondary flow 30% to 50% to a
          UA
        </li>
        <li style={listItemStyle}>
          <span style={numberStyle}>7.2</span> - Secondary flow 30% to 50% to a
          large UC
        </li>
        <li style={listItemStyle}>
          <span style={numberStyle}>8</span> - Small town high commuting:
          primary flow 30% or more to a small UC
        </li>

        <li style={listItemStyle}>
          <span style={numberStyle}>8.1</span> - Secondary flow 30% to 50% to a
          UA
        </li>
        <li style={listItemStyle}>
          <span style={numberStyle}>8.2</span> - Secondary flow 30% to 50% to a
          large UC
        </li>

        <li style={listItemStyle}>
          <span style={numberStyle}>9</span> - Small town low commuting: primary
          flow 10% to 30% to a small UC
        </li>

        <li style={listItemStyle}>
          <span style={numberStyle}>10</span> - Rural areas: primary flow to a
          tract outside a UA or UC
        </li>

        <li style={listItemStyle}>
          <span style={numberStyle}>10.1</span> - Secondary flow 30% to 50% to a
          UA
        </li>
        <li style={listItemStyle}>
          <span style={numberStyle}>10.2</span> - Secondary flow 30% to 50% to a
          large UC
        </li>
        <li style={listItemStyle}>
          <span style={numberStyle}>10.3</span> - Secondary flow 30% to 50% to a
          small UC
        </li>
        <li style={listItemStyle}>
          <span style={numberStyle}>99</span> - Not coded: Census tract has zero
          population and no rural-urban identifier information
        </li>
      </ul>
    </div>
  );
};

function RucaInfo() {
  const CustomWidthTooltip = styled(({ className, ...props }) => (
    <Tooltip {...props} classes={{ popper: className }} />
  ))({
    [`& .${tooltipClasses.tooltip}`]: {
      maxWidth: 700,
    },
  });
  return (
    <CustomWidthTooltip title={<TooltipContent />} arrow>
      <IconButton>
        <InfoIcon />
      </IconButton>
    </CustomWidthTooltip>
  );
}

export default RucaInfo;
