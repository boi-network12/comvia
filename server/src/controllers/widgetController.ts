import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import { NotFoundError } from '../utils/errors';

// @desc    Get widget settings
// @route   GET /api/widget/settings
// @access  Private
export const getWidgetSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user?.id).select('widgetSettings companyName companyLogo');
    if (!user) {
      throw new NotFoundError('User not found');
    }

    res.status(200).json({
      success: true,
      data: {
        widgetSettings: user.widgetSettings,
        companyName: user.companyName,
        companyLogo: user.companyLogo,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update widget appearance
// @route   PUT /api/widget/appearance
// @access  Private
export const updateWidgetAppearance = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { position, color, icon, font } = req.body;
    const user = await User.findById(req.user?.id);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (position) user.widgetSettings.position = position;
    if (color) user.widgetSettings.color = color;
    if (icon) user.widgetSettings.icon = icon;
    if (font) user.widgetSettings.font = font;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Widget appearance updated successfully',
      data: user.widgetSettings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update widget content
// @route   PUT /api/widget/content
// @access  Private
export const updateWidgetContent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { welcomeMessage, quickReplies } = req.body;
    const user = await User.findById(req.user?.id);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (welcomeMessage) user.widgetSettings.welcomeMessage = welcomeMessage;
    if (quickReplies) user.widgetSettings.quickReplies = quickReplies;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Widget content updated successfully',
      data: user.widgetSettings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get widget embed script
// @route   GET /api/widget/embed
// @access  Private
export const getWidgetEmbedScript = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const settings = {
      companyId: user.companyId || user._id, // ✅ Add companyId
      position: user.widgetSettings.position,
      color: user.widgetSettings.color,
      icon: user.widgetSettings.icon,
      font: user.widgetSettings.font,
      welcomeMessage: user.widgetSettings.welcomeMessage,
      quickReplies: user.widgetSettings.quickReplies,
      companyName: user.companyName,
      companyLogo: user.companyLogo,
    };

    // Generate the widget script using the WidgetLoader approach
    const script = `<Script
      id="comvia-widget-loader"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: \`
          (function() {
            var settings = ${JSON.stringify(settings)};
            var script = document.createElement('script');
            script.src = '${process.env.WIDGET_JS_URL || 'https://comvia-widget.vercel.app/comvia-widget.min.js'}';
            script.setAttribute('data-settings', encodeURIComponent(JSON.stringify(settings)));
            document.head.appendChild(script);
          })();
        \`
      }}
      onLoad={() => setIsLoaded(true)}
    />`;

        // Also provide the vanilla JS version for non-Next.js sites
        const vanillaScript = `<script>
      (function() {
        var settings = ${JSON.stringify(settings)};
        var script = document.createElement('script');
        script.src = '${process.env.WIDGET_JS_URL || 'https://comvia-widget.vercel.app/comvia-widget.min.js'}';
        script.setAttribute('data-settings', encodeURIComponent(JSON.stringify(settings)));
        document.head.appendChild(script);
      })();
    </script>`;

    res.status(200).json({
      success: true,
      data: {
        script,
        vanillaScript, // For non-Next.js sites
        scriptUrl: process.env.WIDGET_JS_URL || 'https://comvia-widget.vercel.app/comvia-widget.min.js',
        settings, // Return settings for debugging
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Preview widget
// @route   GET /api/widget/preview
// @access  Private
export const previewWidget = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Return settings for preview
    res.status(200).json({
      success: true,
      data: {
        settings: user.widgetSettings,
        companyName: user.companyName,
        companyLogo: user.companyLogo,
      },
    });
  } catch (error) {
    next(error);
  }
};